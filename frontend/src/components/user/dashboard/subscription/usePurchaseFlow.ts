"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/shared/ui/ToastProvider";
import { useRazorpayCheckout } from "@/hooks/useRazorpayCheckout";
import { ApiError } from "@/services/apiClient";
import { getToken } from "@/services/session";
import {
  createSubscriptionOrder,
  requestQuote,
  verifySubscriptionPayment,
  type PurchasablePackage,
  type SubscriptionQuote,
} from "@/services/userSubscription.service";
import {
  calculatePreview,
  clampQuantity,
  getListingChoices,
  getMonthChoices,
  isValidGstin,
} from "./subscriptionShared";

const LOGIN_PATH = "/login";
const GENERIC_ERROR = "Something went wrong. Please try again.";
const CANCELLED_MESSAGE = "The payment was not completed. You can try again.";
const PENDING_MESSAGE = "Your payment is being confirmed. Your credits will appear here shortly.";
const UNCONFIRMED_MESSAGE =
  "We could not confirm your payment yet. If money was deducted, your credits will be added automatically shortly.";
const GSTIN_ERROR = "Enter a valid 15 character GSTIN or leave it empty";
const SUCCESS_TOAST = "Payment successful. Your Standard package is now active.";

export type PurchasePhase = "idle" | "quoting" | "paying" | "verifying";
export type PurchaseMessage = { type: "error" | "info"; text: string };

type PurchaseFlowOptions = {
  pkg: PurchasablePackage;
  onCompleted: () => void;
};

export function usePurchaseFlow({ pkg, onCompleted }: PurchaseFlowOptions) {
  const router = useRouter();
  const { showToast } = useToast();
  const { openCheckout, preloadCheckout } = useRazorpayCheckout();
  const listingChoices = getListingChoices(pkg);
  const monthChoices = getMonthChoices(pkg);

  const [listings, setListings] = useState(listingChoices.min);
  const [months, setMonths] = useState(monthChoices.min);
  const [quote, setQuote] = useState<SubscriptionQuote | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [gstin, setGstin] = useState("");
  const [gstinError, setGstinError] = useState("");
  const [phase, setPhase] = useState<PurchasePhase>("idle");
  const [message, setMessage] = useState<PurchaseMessage | null>(null);

  const preview = useMemo(() => calculatePreview(pkg, listings, months), [pkg, listings, months]);

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

  const changeListings = (value: number) => setListings(clampQuantity(value, listingChoices.min, listingChoices.max));
  const changeMonths = (value: number) => setMonths(clampQuantity(value, monthChoices.min, monthChoices.max));

  const changeGstin = (value: string) => {
    setGstin(value.toUpperCase());
    setGstinError("");
  };

  const openSummary = async () => {
    const token = getToken();
    if (!token) {
      router.push(LOGIN_PATH);
      return;
    }

    setMessage(null);
    setPhase("quoting");
    try {
      setQuote(await requestQuote({ listings, months }, token));
      setIsSummaryOpen(true);
    } catch (failure) {
      fail(failure);
    } finally {
      setPhase("idle");
    }
  };

  const closeSummary = () => {
    setIsSummaryOpen(false);
    setMessage(null);
  };

  const pay = async () => {
    const token = getToken();
    if (!token) {
      router.push(LOGIN_PATH);
      return;
    }

    const trimmedGstin = gstin.trim();
    if (trimmedGstin && !isValidGstin(trimmedGstin)) {
      setGstinError(GSTIN_ERROR);
      return;
    }

    setMessage(null);
    setPhase("paying");

    let created;
    try {
      created = await createSubscriptionOrder({ listings, months, gstin: trimmedGstin || undefined }, token);
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
        showToast(SUCCESS_TOAST, "success");
        setIsSummaryOpen(false);
      } else {
        setMessage({ type: "info", text: PENDING_MESSAGE });
      }
    } catch {
      // The webhook still confirms a payment the browser could not report
      setMessage({ type: "info", text: UNCONFIRMED_MESSAGE });
    } finally {
      setPhase("idle");
      onCompleted();
    }
  };

  return {
    listings,
    months,
    listingChoices,
    monthChoices,
    preview,
    quote,
    isSummaryOpen,
    gstin,
    gstinError,
    phase,
    message,
    changeListings,
    changeMonths,
    changeGstin,
    openSummary,
    closeSummary,
    pay,
  };
}
