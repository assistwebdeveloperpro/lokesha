"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ApiError } from "@/services/apiClient";
import { getToken } from "@/services/session";
import {
  createLeadPackOrder,
  quoteLeadPack,
  type LeadPackQuote,
  type PropertyLeadUsage,
  type PurchasablePackage,
} from "@/services/userSubscription.service";
import { clampQuantity, getLeadChoices, isValidGstin } from "./subscriptionShared";
import { useCheckoutRunner } from "./useCheckoutRunner";

const LOGIN_PATH = "/login";
const QUOTE_DEBOUNCE_MS = 350;
const QUOTE_ERROR = "We could not price these leads. Please try again.";
const PENDING_MESSAGE = "Your payment is being confirmed. Your extra leads will appear here shortly.";
const UNCONFIRMED_MESSAGE =
  "We could not confirm your payment yet. If money was deducted, your extra leads will be added automatically shortly.";
const GSTIN_ERROR = "Enter a valid 15 character GSTIN or leave it empty";
const SUCCESS_TOAST = "Payment successful. Extra leads were added to your property.";

type LeadPackPurchaseOptions = {
  pkg: PurchasablePackage;
  property: PropertyLeadUsage;
  onClose: () => void;
  onCompleted: () => void;
};

type QuoteFailure = { leads: number; text: string };

export function useLeadPackPurchase({ pkg, property, onClose, onCompleted }: LeadPackPurchaseOptions) {
  const router = useRouter();
  const choices = getLeadChoices(pkg);

  const [leads, setLeads] = useState(choices.min);
  const [quote, setQuote] = useState<LeadPackQuote | null>(null);
  const [quoteFailure, setQuoteFailure] = useState<QuoteFailure | null>(null);
  const [gstin, setGstin] = useState("");
  const [gstinError, setGstinError] = useState("");
  const hasQuoted = useRef(false);

  const checkout = useCheckoutRunner({
    successToast: SUCCESS_TOAST,
    pendingMessage: PENDING_MESSAGE,
    unconfirmedMessage: UNCONFIRMED_MESSAGE,
    onPaid: onClose,
    onSettled: onCompleted,
  });

  // The server prices the leads, so a quantity change asks for a new quote once typing settles
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push(LOGIN_PATH);
      return;
    }

    let cancelled = false;
    const delay = hasQuoted.current ? QUOTE_DEBOUNCE_MS : 0;
    hasQuoted.current = true;

    const timer = setTimeout(() => {
      quoteLeadPack({ propertyId: property.id, leads }, token)
        .then((response) => {
          if (cancelled) return;
          setQuote(response);
          setQuoteFailure(null);
        })
        .catch((failure: unknown) => {
          if (cancelled) return;
          if (failure instanceof ApiError && failure.status === 401) {
            router.push(LOGIN_PATH);
            return;
          }
          setQuoteFailure({ leads, text: failure instanceof Error ? failure.message : QUOTE_ERROR });
        });
    }, delay);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [leads, property.id, router]);

  const quoteError = quoteFailure?.leads === leads ? quoteFailure.text : "";
  const isQuoting = !quoteError && quote?.leads !== leads;

  const changeLeads = (value: number) => setLeads(clampQuantity(value, choices.min, choices.max));

  const changeGstin = (value: string) => {
    setGstin(value.toUpperCase());
    setGstinError("");
  };

  const pay = async () => {
    const trimmedGstin = gstin.trim();
    if (trimmedGstin && !isValidGstin(trimmedGstin)) {
      setGstinError(GSTIN_ERROR);
      return;
    }

    await checkout.run((token) =>
      createLeadPackOrder({ propertyId: property.id, leads, gstin: trimmedGstin || undefined }, token),
    );
  };

  return {
    leads,
    choices,
    quote,
    isQuoting,
    isPayable: Boolean(quote) && !isQuoting && !quoteError,
    gstin,
    gstinError,
    phase: checkout.phase,
    message: quoteError ? { type: "error" as const, text: quoteError } : checkout.message,
    changeLeads,
    changeGstin,
    pay,
  };
}
