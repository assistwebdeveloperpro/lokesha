"use client";

import type { LucideIcon } from "lucide-react";
import { BadgeCheck, Building2, Check, Home, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, type ReactNode } from "react";
import type { PublicSearchPostedBy } from "@/components/landing/property-search/property-list/publicSearchListing.types";

type PropertyContactSuccessModalProps = {
  postedBy: PublicSearchPostedBy;
  contactName: string;
  contactPhone?: string;
  creditBalance?: number;
  onClose: () => void;
};

type ContactVariantConfig = {
  subtitle: string;
  Icon: LucideIcon;
  iconClassName: string;
  cardAccentClassName: string;
};

const VARIANT: Record<PublicSearchPostedBy, ContactVariantConfig> = {
  builder: {
    subtitle: "Your inquiry has been successfully sent to the property developer.",
    Icon: Building2,
    iconClassName: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/20",
    cardAccentClassName: "from-emerald-50/90 via-white to-sky-50/40 border-emerald-200/80",
  },
  owner: {
    subtitle: "Your inquiry has been successfully sent to the property owner.",
    Icon: Home,
    iconClassName: "bg-sky-500/15 text-sky-700 ring-sky-500/20",
    cardAccentClassName: "from-sky-50/90 via-white to-emerald-50/30 border-sky-200/80",
  },
  dealer: {
    subtitle: "Your inquiry has been successfully sent to the real estate agent.",
    Icon: UserRound,
    iconClassName: "bg-navy-blue/10 text-navy-blue ring-navy-blue/15",
    cardAccentClassName: "from-slate-100/90 via-white to-emerald-50/30 border-slate-200/90",
  },
};

const DEFAULT_PHONE = "+91 96244 96001";

function StepItem({ index, children }: { index: number; children: ReactNode }) {
  return (
    <li className="flex gap-3 text-sm leading-relaxed text-slate-600">
      <span
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-emerald-500/35 bg-emerald-50 text-xs font-bold text-emerald-700"
        aria-hidden
      >
        {index}
      </span>
      <span className="pt-0.5">{children}</span>
    </li>
  );
}

export function PropertyContactSuccessModal({
  postedBy,
  contactName,
  contactPhone = DEFAULT_PHONE,
  creditBalance = 2,
  onClose,
}: PropertyContactSuccessModalProps) {
  const variant = VARIANT[postedBy];
  const { Icon } = variant;
  const headingId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Close contact success dialog backdrop"
        className="absolute inset-0 cursor-pointer bg-slate-900/55 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/15"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-emerald-50/80 to-transparent" aria-hidden />

        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-slate-200/80 bg-white/90 text-slate-500 shadow-sm transition hover:bg-white hover:text-slate-700"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>

        <div className="relative px-5 pb-5 pt-8 sm:px-7 sm:pb-6 sm:pt-9">
          <div className="flex flex-col items-center text-center">
            <div
              className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30"
              aria-hidden
            >
              <span className="absolute inset-0 rounded-full ring-4 ring-emerald-400/25" />
              <Check className="h-8 w-8 text-white" strokeWidth={2.5} />
            </div>
            <h2 id={headingId} className="font-display mt-4 text-2xl font-bold tracking-tight text-slate-900">
              You&apos;re Connected!
            </h2>
            <p className="mt-2 max-w-sm text-sm text-slate-600">{variant.subtitle}</p>
          </div>

          <div
            className={`mt-6 flex items-center gap-3 rounded-xl border bg-linear-to-r p-3.5 shadow-sm sm:p-4 ${variant.cardAccentClassName}`}
          >
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ${variant.iconClassName}`}
              aria-hidden
            >
              <Icon className="h-6 w-6" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-base font-bold text-slate-900">{contactName}</p>
              <p className="mt-0.5 text-sm font-medium text-slate-600">{contactPhone}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                Unlocked
              </span>
              <p className="text-[11px] font-medium text-slate-500">Credit balance: {creditBalance}</p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-bold text-slate-900">What next?</h3>
            <ol className="mt-3 space-y-3">
              <StepItem index={1}>
                You can now view your connected property information in your{" "}
                <Link
                  href="#"
                  className="font-semibold text-navy-blue underline decoration-navy-blue/30 underline-offset-2 transition hover:decoration-navy-blue"
                  onClick={onClose}
                >
                  Contacted Properties
                </Link>{" "}
                section.
              </StepItem>
              <StepItem index={2}>
                View your inquiry details and remaining contact credits anytime from{" "}
                <span className="font-semibold text-slate-800">Dashboard</span>
                {" → "}
                <Link
                  href="/user/subscription/package-usage"
                  className="font-semibold text-navy-blue underline decoration-navy-blue/30 underline-offset-2 transition hover:decoration-navy-blue"
                  onClick={onClose}
                >
                  My Package Usage
                </Link>
                .
              </StepItem>
            </ol>
          </div>

          <div className="mt-7 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end sm:gap-3">
            <button
              ref={cancelRef}
              type="button"
              onClick={onClose}
              className="min-h-11 w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
            >
              Cancel
            </button>
            <Link
              href="#"
              onClick={onClose}
              className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-linear-to-r-navy-blue px-5 text-sm font-semibold text-white shadow-md transition hover:opacity-95 sm:w-auto"
            >
              Contacted Properties
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
