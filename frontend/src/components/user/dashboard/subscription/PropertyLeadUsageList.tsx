import { AlertTriangle, ArrowUpRight, Building2, CalendarClock, CircleCheck, Gauge, Hash, Inbox, PlusCircle, Target } from "lucide-react";
import type { ComponentType } from "react";
import Link from "next/link";
import type { PropertyLeadUsage } from "@/services/userSubscription.service";
import { canBuyMoreLeads, formatDate } from "./subscriptionShared";

const UPGRADE_PATH = "/user/subscription/subscribed-services#buy-standard";

type PropertyLeadUsageListProps = {
  properties: PropertyLeadUsage[];
  isLeadPackAvailable: boolean;
  onBuyLeads: (property: PropertyLeadUsage) => void;
};

type UsageItemProps = Pick<PropertyLeadUsageListProps, "isLeadPackAvailable" | "onBuyLeads"> & { property: PropertyLeadUsage };

type Stat = { label: string; value: string; Icon: ComponentType<{ className?: string }>; accent: string };

function UsageItem({ property, isLeadPackAvailable, onBuyLeads }: UsageItemProps) {
  const { leadLimit, leadsReceived, isLimitReached } = property;
  const usedPercent = leadLimit ? Math.min(100, Math.round((leadsReceived / leadLimit) * 100)) : 0;
  const leadsLeft = leadLimit === null ? null : Math.max(0, leadLimit - leadsReceived);

  const stats: Stat[] = [
    { label: "Received", value: String(leadsReceived), Icon: Inbox, accent: "bg-sky-50 text-sky-600" },
    { label: "Limit", value: leadLimit === null ? "Unlimited" : String(leadLimit), Icon: Target, accent: "bg-slate-100 text-slate-600" },
    {
      label: "Left",
      value: leadsLeft === null ? "Unlimited" : String(leadsLeft),
      Icon: Gauge,
      accent: isLimitReached ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <li
      className={`min-w-0 overflow-hidden rounded-2xl border bg-white p-4 shadow-sm sm:p-5 ${
        isLimitReached ? "border-amber-300" : "border-slate-200/90"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="bg-linear-to-r-navy-blue flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm">
            <Building2 className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-800">{property.title}</p>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Hash className="h-3.5 w-3.5" aria-hidden />
                Listing {property.listingNumber}
              </span>
              {property.expiresAt ? (
                <span className="inline-flex items-center gap-1">
                  <CalendarClock className="h-3.5 w-3.5" aria-hidden />
                  Live until {formatDate(property.expiresAt)}
                </span>
              ) : null}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-600 ring-1 ring-slate-200">
          <CircleCheck className="h-3.5 w-3.5" aria-hidden />
          {property.status}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        {stats.map(({ label, value, Icon, accent }) => (
          <div key={label} className="flex min-w-0 items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/60 p-2.5">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${accent}`}>
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</dt>
              <dd className="truncate text-sm font-bold tabular-nums text-slate-800">{value}</dd>
            </div>
          </div>
        ))}
      </dl>

      {leadLimit !== null ? (
        <div
          role="progressbar"
          aria-label="Leads received"
          aria-valuemin={0}
          aria-valuemax={leadLimit}
          aria-valuenow={Math.min(leadsReceived, leadLimit)}
          className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100"
        >
          <div className={`h-full rounded-full transition-all ${isLimitReached ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${usedPercent}%` }} />
        </div>
      ) : null}

      {isLimitReached ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200">
          <p className="flex items-start gap-2 text-sm font-medium text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            Lead limit reached. This property will not receive new leads, your existing leads stay with you.
          </p>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {isLeadPackAvailable && canBuyMoreLeads(property) ? (
              <button
                type="button"
                onClick={() => onBuyLeads(property)}
                className="bg-linear-to-r-navy-blue inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg px-3.5 text-sm font-semibold text-white shadow-sm"
              >
                <PlusCircle className="h-4 w-4" aria-hidden />
                Buy more leads
              </button>
            ) : null}
            <Link
              href={UPGRADE_PATH}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-white px-3.5 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              Upgrade
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      ) : null}
    </li>
  );
}

export default function PropertyLeadUsageList({ properties, isLeadPackAvailable, onBuyLeads }: PropertyLeadUsageListProps) {
  return (
    <ul className="space-y-4">
      {properties.map((property) => (
        <UsageItem key={property.id} property={property} isLeadPackAvailable={isLeadPackAvailable} onBuyLeads={onBuyLeads} />
      ))}
    </ul>
  );
}
