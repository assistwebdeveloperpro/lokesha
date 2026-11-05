"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export const REVIEW_PROPERTIES_LIST_PATH = "/backend/properties/review-properties";

export const backToReviewListNavClassName =
  "group inline-flex min-h-11 cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-sky-200 hover:bg-sky-50/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-blue sm:px-5";

function BackToReviewListNavContent() {
  return (
    <>
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-navy-blue transition group-hover:border-sky-200 group-hover:bg-white"
        aria-hidden
      >
        <ArrowLeft className="h-4 w-4" />
      </span>
      Back to review list
    </>
  );
}

type BackToReviewListLinkProps = {
  href?: string;
  className?: string;
};

export function BackToReviewListLink({
  href = REVIEW_PROPERTIES_LIST_PATH,
  className,
}: BackToReviewListLinkProps) {
  return (
    <Link href={href} className={cn(backToReviewListNavClassName, className)}>
      <BackToReviewListNavContent />
    </Link>
  );
}

type BackToReviewListButtonProps = {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
};

export function BackToReviewListButton({ onClick, className, disabled }: BackToReviewListButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        backToReviewListNavClassName,
        "sm:min-w-52 sm:px-6 disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      <BackToReviewListNavContent />
    </button>
  );
}
