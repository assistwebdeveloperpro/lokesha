import { BadgeCheck, Clock } from "lucide-react";
import type { LeadVerificationStatus } from "@/services/adminLeads.service";

const STATUS_CONFIG = {
  verified: { label: "Verified", Icon: BadgeCheck, className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  not_verified: { label: "Not verified", Icon: Clock, className: "bg-amber-50 text-amber-700 ring-amber-200" },
} as const;

export default function LeadStatusBadge({ status }: { status: LeadVerificationStatus }) {
  const { label, Icon, className } = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${className}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label}
    </span>
  );
}
