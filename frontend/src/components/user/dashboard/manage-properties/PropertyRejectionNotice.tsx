import { AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getEditHref } from "./managePropertiesShared";

const FALLBACK_REASON =
  "Our team could not approve this listing yet. Open the property, fix the details, and submit it again for review.";

type PropertyRejectionNoticeProps = {
  propertyId: string;
  reason?: string | null;
};

export default function PropertyRejectionNotice({ propertyId, reason }: PropertyRejectionNoticeProps) {
  const feedback = reason?.trim() || FALLBACK_REASON;

  return (
    <div
      className="mt-3 overflow-hidden rounded-xl border border-rose-200/90 bg-white shadow-sm ring-1 ring-rose-100/80"
      role="note"
      aria-label="Rejection feedback"
    >
      <div className="border-b border-rose-100/90 bg-rose-50/80 px-3.5 py-2.5 sm:px-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-rose-100">
            <AlertCircle className="h-4 w-4 text-rose-600" strokeWidth={2.25} aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-rose-950">Changes requested</p>
            <p className="text-xs text-rose-800/75">Review team feedback below</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 px-3.5 py-3.5 sm:px-4 sm:py-4">
        <div className="rounded-lg border border-slate-200/90 bg-slate-50/80 px-3 py-2.5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Reason</p>
          <p className="mt-1.5 text-sm leading-relaxed wrap-break-word text-slate-800">{feedback}</p>
        </div>

        <div className="flex flex-col gap-2 rounded-lg border border-sky-100 bg-sky-50/50 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-relaxed text-slate-600">
            Update the listing based on this feedback, then resubmit from the edit page.
          </p>
          <Link
            href={getEditHref(propertyId)}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-sky-700 shadow-sm ring-1 ring-sky-200/90 transition hover:bg-sky-50 hover:text-sky-800"
          >
            Edit &amp; resubmit
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
