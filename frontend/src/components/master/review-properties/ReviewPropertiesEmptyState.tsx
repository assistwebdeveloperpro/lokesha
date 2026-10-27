import type { ReviewStatus } from "@/services/propertyReview.service";
import { Archive, BadgeCheck, ClipboardList, ShieldX } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { REVIEW_EMPTY_STATES } from "./reviewPropertiesShared";

const EMPTY_STATE_VISUALS: Record<
  ReviewStatus,
  { icon: LucideIcon; iconWrap: string; iconColor: string }
> = {
  pending: {
    icon: ClipboardList,
    iconWrap: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  published: {
    icon: BadgeCheck,
    iconWrap: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  rejected: {
    icon: ShieldX,
    iconWrap: "bg-rose-50",
    iconColor: "text-rose-600",
  },
  closed: {
    icon: Archive,
    iconWrap: "bg-slate-100",
    iconColor: "text-slate-600",
  },
};

type ReviewPropertiesEmptyStateProps = {
  status: ReviewStatus;
};

export default function ReviewPropertiesEmptyState({ status }: ReviewPropertiesEmptyStateProps) {
  const { title, description } = REVIEW_EMPTY_STATES[status];
  const { icon: Icon, iconWrap, iconColor } = EMPTY_STATE_VISUALS[status];

  return (
    <div className="flex flex-col items-center rounded-2xl border border-slate-200/90 bg-white px-6 py-16 text-center sm:py-20">
      <span
        className={`flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl shadow-sm ring-1 ring-black/5 ${iconWrap}`}
      >
        <Icon className={`h-9 w-9 ${iconColor}`} strokeWidth={1.75} aria-hidden />
      </span>
      <h2 className="font-display mt-6 text-lg font-bold tracking-tight text-slate-800 sm:text-xl">
        {title}
      </h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}
