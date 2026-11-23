"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { getToken } from "@/services/session";
import {
  createSubscriptionOrder,
  requestQuote,
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
import { useCheckoutRunner } from "./useCheckoutRunner";

const LOGIN_PATH = "/login";
const PENDING_MESSAGE = "Your payment is being confirmed. Your credits will appear here shortly.";
const UNCONFIRMED_MESSAGE =
  "We could not confirm your payment yet. If money was deducted, your credits will be added automatically shortly.";
const GSTIN_ERROR = "Enter a valid 15 character GSTIN or leave it empty";
const SUCCESS_TOAST = "Payment successful. Your Standard package is now active.";

export type PurchasePhase = "idle" | "quoting" | "paying" | "verifying";

type PurchaseFlowOptions = {
  pkg: PurchasablePackage;
  onCompleted: () => void;
};

export function usePurchaseFlow({ pkg, onCompleted }: PurchaseFlowOptions) {
  const router = useRouter();
  const listingChoices = getListingChoices(pkg);
  const monthChoices = getMonthChoices(pkg);

  const [listings, setListings] = useState(listingChoices.min);
  const [months, setMonths] = useState(monthChoices.min);
  const [quote, setQuote] = useState<SubscriptionQuote | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isQuoting, setIsQuoting] = useState(false);
  const [gstin, setGstin] = useState("");
  const [gstinError, setGstinError] = useState("");

  const checkout = useCheckoutRunner({
    successToast: SUCCESS_TOAST,
    pendingMessage: PENDING_MESSAGE,
    unconfirmedMessage: UNCONFIRMED_MESSAGE,
    onPaid: () => setIsSummaryOpen(false),
    onSettled: onCompleted,
  });
  const { message, setMessage, fail } = checkout;
  const phase: PurchasePhase = isQuoting ? "quoting" : checkout.phase;

  const preview = useMemo(() => calculatePreview(pkg, listings, months), [pkg, listings, months]);

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
    setIsQuoting(true);
    try {
      setQuote(await requestQuote({ listings, months }, token));
      setIsSummaryOpen(true);
    } catch (failure) {
      fail(failure);
    } finally {
      setIsQuoting(false);
    }
  };

  const closeSummary = () => {
    setIsSummaryOpen(false);
    setMessage(null);
  };

  const pay = async () => {
    const trimmedGstin = gstin.trim();
    if (trimmedGstin && !isValidGstin(trimmedGstin)) {
      setGstinError(GSTIN_ERROR);
      return;
    }

    await checkout.run((token) => createSubscriptionOrder({ listings, months, gstin: trimmedGstin || undefined }, token));
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
