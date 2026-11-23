"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/components/shared/ui/ToastProvider";
import { useRazorpayCheckout } from "@/hooks/useRazorpayCheckout";
import { ApiError } from "@/services/apiClient";
import { getToken } from "@/services/session";
import { verifySubscriptionPayment, type CheckoutDetails } from "@/services/userSubscription.service";

const LOGIN_PATH = "/login";
const GENERIC_ERROR = "Something went wrong. Please try again.";
const CANCELLED_MESSAGE = "The payment was not completed. You can try again.";

export type PaymentPhase = "idle" | "paying" | "verifying";
export type PurchaseMessage = { type: "error" | "info"; text: string };

type CheckoutOrder = { order: { id: string }; checkout: CheckoutDetails };

type CheckoutRunnerOptions = {
  successToast: string;
  pendingMessage: string;
  unconfirmedMessage: string;
  onPaid: () => void;
  onSettled: () => void;
};

// The payment steps every purchase shares: create the order, open the gateway, then verify the payment
export function useCheckoutRunner({ successToast, pendingMessage, unconfirmedMessage, onPaid, onSettled }: CheckoutRunnerOptions) {
  const router = useRouter();
  const { showToast } = useToast();
  const { openCheckout, preloadCheckout } = useRazorpayCheckout();
  const [phase, setPhase] = useState<PaymentPhase>("idle");
  const [message, setMessage] = useState<PurchaseMessage | null>(null);

  // Warming the payment window up makes checkout open instantly
  useEffect(() => {
    preloadCheckout();
  }, [preloadCheckout]);

  const fail = (failure: unknown) => {
    if (failure instanceof ApiError && failure.status === 401) {
      router.push(LOGIN_PATH);
      return;
    }
    setMessage({ type: "error", text: failure instanceof Error ? failure.message : GENERIC_ERROR });
  };

  const run = async (createOrder: (token: string) => Promise<CheckoutOrder>) => {
    const token = getToken();
    if (!token) {
      router.push(LOGIN_PATH);
      return;
    }

    setMessage(null);
    setPhase("paying");

    let created: CheckoutOrder;
    try {
      created = await createOrder(token);
    } catch (failure) {
      fail(failure);
      setPhase("idle");
      return;
    }

    let outcome;
    try {
      outcome = await openCheckout(created.checkout);
    } catch (failure) {
      fail(failure);
      setPhase("idle");
      return;
    }

    if (outcome.status === "dismissed") {
      setMessage({ type: "error", text: outcome.failureMessage ?? CANCELLED_MESSAGE });
      setPhase("idle");
      return;
    }

    setPhase("verifying");
    try {
      const result = await verifySubscriptionPayment(created.order.id, outcome.payment, token);
      if (result.status === "paid") {
        showToast(successToast, "success");
        onPaid();
      } else {
        setMessage({ type: "info", text: pendingMessage });
      }
    } catch {
      // The webhook still confirms a payment the browser could not report
      setMessage({ type: "info", text: unconfirmedMessage });
    } finally {
      setPhase("idle");
      onSettled();
    }
  };

  return { phase, message, setMessage, fail, run };
}
