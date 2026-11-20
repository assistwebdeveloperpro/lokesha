"use client";

import { useCallback } from "react";
import type { CheckoutDetails } from "@/services/userSubscription.service";

const SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";
const THEME_COLOR = "#12192b";
const SCRIPT_ERROR = "We could not load the payment window. Check your connection and try again.";

export type PaymentSuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

// Closing the window without paying is a normal outcome, not an error
export type CheckoutOutcome =
  | { status: "paid"; payment: PaymentSuccess }
  | { status: "dismissed"; failureMessage: string | null };

type RazorpayOptions = {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  handler: (payment: PaymentSuccess) => void;
  modal: { ondismiss: () => void };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", callback: (response: { error?: { description?: string } }) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadCheckoutScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error(SCRIPT_ERROR));
  if (window.Razorpay) return Promise.resolve();

  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      script.remove();
      reject(new Error(SCRIPT_ERROR));
    };
    document.body.appendChild(script);
  });

  return scriptPromise;
}

export function buildCheckoutOptions(
  details: CheckoutDetails,
  handlers: Pick<RazorpayOptions, "handler"> & { onDismiss: () => void },
): RazorpayOptions {
  return {
    key: details.keyId,
    order_id: details.razorpayOrderId,
    amount: details.amount,
    currency: details.currency,
    name: details.name,
    description: details.description,
    prefill: {
      name: details.prefill.name,
      email: details.prefill.email ?? "",
      contact: details.prefill.contact,
    },
    theme: { color: THEME_COLOR },
    handler: handlers.handler,
    modal: { ondismiss: handlers.onDismiss },
  };
}

export function useRazorpayCheckout() {
  const preloadCheckout = useCallback(() => {
    loadCheckoutScript().catch(() => undefined);
  }, []);

  const openCheckout = useCallback(async (details: CheckoutDetails): Promise<CheckoutOutcome> => {
    await loadCheckoutScript();

    return new Promise<CheckoutOutcome>((resolve) => {
     
      let failureMessage: string | null = null;

      const checkout = new window.Razorpay!(
        buildCheckoutOptions(details, {
          handler: (payment) => resolve({ status: "paid", payment }),
          onDismiss: () => resolve({ status: "dismissed", failureMessage }),
        }),
      );
      checkout.on("payment.failed", (response) => {
        failureMessage = response.error?.description ?? "The payment could not be completed.";
      });
      checkout.open();
    });
  }, []);

  return { openCheckout, preloadCheckout };
}
