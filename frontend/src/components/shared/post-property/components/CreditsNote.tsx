"use client";

import { AlertTriangle, Ticket } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getToken } from "@/services/session";
import { fetchCreditAvailability, type CreditAvailability } from "@/services/userSubscription.service";

const BUY_PATH = "/user/subscription/subscribed-services#buy-standard";

function useCreditAvailability() {
  const [credits, setCredits] = useState<CreditAvailability | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    function load() {
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      fetchCreditAvailability(token)
        .then((response) => {
          if (!cancelled) setCredits(response);
        })
        .catch(() => undefined)
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    }

    function handleVisibility() {
      if (document.visibilityState === "visible") load();
    }

    load();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return { credits, isLoading };
}

export default function CreditsNote() {
  const { credits, isLoading } = useCreditAvailability();

  if (isLoading) {
    return <div className="mt-4 h-10 w-64 animate-pulse rounded-xl bg-slate-200/80" aria-hidden />;
  }
  // The note is a convenience, so a failed lookup shows nothing
  if (!credits) return null;

  if (credits.submittable === 0) {
    return (
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-900 ring-1 ring-amber-200">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" aria-hidden />
        You have no listing credits left to submit a new property.
        <Link href={BUY_PATH} target="_blank" rel="noopener" className="font-bold text-amber-900 underline underline-offset-2">
          Buy Standard Package
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-900 ring-1 ring-sky-200">
      <Ticket className="h-4 w-4 text-sky-600" aria-hidden />
      You have {credits.submittable} listing {credits.submittable === 1 ? "credit" : "credits"} left
    </div>
  );
}
