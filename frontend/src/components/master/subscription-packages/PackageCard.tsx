import {
  CalendarDays,
  Check,
  Clock,
  Crown,
  Gift,
  History,
  IndianRupee,
  Layers,
  Pencil,
  PlusCircle,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { ComponentType } from "react";
import type { SubscriptionPackage } from "@/services/adminSubscription.service";
import { formatRupees } from "@/lib/currency";
import { formatDateTime } from "./subscriptionPackagesShared";

type PackageCardProps = {
  pkg: SubscriptionPackage;
  onEdit: (pkg: SubscriptionPackage) => void;
  onViewHistory: (pkg: SubscriptionPackage) => void;
};

type Stat = { label: string; value: string; hint?: string; Icon: ComponentType<{ className?: string }> };

const HEADER_ICONS: Record<SubscriptionPackage["code"], LucideIcon> = {
  free: Gift,
  standard: Crown,
  leads: PlusCircle,
};

const formatRange =(min: number, max: number, unit: string) =>
  min === max ? `${min} ${unit}` : `${min} – ${max} ${unit}`;

function getStats(pkg: SubscriptionPackage): Stat[] {
  if (pkg.code === "free") {
    return [
      { label: "Free listings", value: String(pkg.freeCredits ?? 0), Icon: Gift },
      { label: "Leads per listing", value: String(pkg.freeLeadLimit ?? 0), Icon: Users },
      { label: "Listing validity", value: `${pkg.freePropertyValidityDays ?? 0} days`, Icon: Clock },
      { label: "Price", value: "Free", hint: "No payment needed", Icon: IndianRupee },
    ];
  }

  if (pkg.code === "leads") {
    return [
      { label: "Per lead", value: formatRupees(pkg.pricePerLead ?? 0), hint: `+ ${pkg.gstPercent}% GST`, Icon: IndianRupee },
      { label: "Leads per purchase", value: formatRange(pkg.minLeads ?? 1, pkg.maxLeads ?? 1, "leads"), Icon: Layers },
      { label: "Validity", value: "No expiry", hint: "Stays with the property", Icon: CalendarDays },
      { label: "Bought for", value: "One property", hint: "Owner of a limited listing", Icon: Users },
    ];
  }

  const customOptions = [pkg.allowCustomQuantity && "Quantity", pkg.allowCustomDuration && "Duration"].filter(Boolean);
  return [
    { label: "Per listing per month", value: formatRupees(pkg.pricePerListingMonth), hint: `+ ${pkg.gstPercent}% GST`, Icon: IndianRupee },
    { label: "Listings", value: formatRange(pkg.minListings, pkg.maxListings, "listings"), Icon: Layers },
    { label: "Duration", value: formatRange(pkg.minMonths, pkg.maxMonths, "months"), Icon: CalendarDays },
    { label: "Custom choice", value: customOptions.length ? customOptions.join(" & ") : "Fixed", Icon: Users },
  ];
}

export default function PackageCard({ pkg, onEdit, onViewHistory }: PackageCardProps) {
  const isActive = pkg.status === "active";
  const HeaderIcon = HEADER_ICONS[pkg.code];

  return (
    <li className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition hover:shadow-md">
      <div className="bg-linear-to-r-navy-blue flex items-center justify-between gap-3 px-4 py-4 text-white sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
            <HeaderIcon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="font-display truncate text-base font-bold">{pkg.displayTitle}</h2>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-300">{pkg.name} package</p>
          </div>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
            isActive ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/40" : "bg-slate-500/20 text-slate-300 ring-slate-400/40"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-slate-400"}`} aria-hidden />
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="flex-1 space-y-5 px-4 py-4 sm:px-6 sm:py-5">
        {pkg.description ? <p className="wrap-break-word text-sm leading-relaxed text-slate-600">{pkg.description}</p> : null}

        <dl className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {getStats(pkg).map(({ label, value, hint, Icon }) => (
            <div key={label} className="min-w-0 rounded-xl border border-slate-100 bg-slate-50 p-3 sm:p-3.5">
              <dt className="flex items-start gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:text-[11px]">
                <Icon className="mt-px h-3.5 w-3.5 shrink-0 text-sky-600" aria-hidden />
                <span className="min-w-0 wrap-break-word">{label}</span>
              </dt>
              <dd className="mt-1.5 wrap-break-word text-sm font-bold text-slate-800 sm:text-base">{value}</dd>
              {hint ? <p className="text-xs font-medium text-slate-500">{hint}</p> : null}
            </div>
          ))}
        </dl>

        {pkg.benefits.length ? (
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Benefits</h3>
            <ul className="mt-2.5 space-y-2">
              {pkg.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                  </span>
                  <span className="min-w-0 wrap-break-word">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-xs font-medium text-slate-500">Updated {formatDateTime(pkg.updatedAt)}</p>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button
            type="button"
            onClick={() => onViewHistory(pkg)}
            className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <History className="h-4 w-4" aria-hidden />
            History
          </button>
          <button
            type="button"
            onClick={() => onEdit(pkg)}
            className="bg-linear-to-r-navy-blue inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white shadow-md"
          >
            <Pencil className="h-4 w-4" aria-hidden />
            Edit package
          </button>
        </div>
      </div>
    </li>
  );
}
