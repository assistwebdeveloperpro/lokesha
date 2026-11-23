import { ArrowUpRight, Building2, PlusCircle } from "lucide-react";
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

function UsageItem({ property, isLeadPackAvailable, onBuyLeads }: UsageItemProps) {
  const { leadLimit, leadsReceived, isLimitReached } = property;
  const usedPercent = leadLimit ? Math.min(100, Math.round((leadsReceived / leadLimit) * 100)) : 0;

  return (
    <li className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <Building2 className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-800">{property.title}</p>
            <p className="text-xs font-medium text-slate-500">
              Listing #{property.listingNumber}
              {property.expiresAt ? ` · Live until ${formatDate(property.expiresAt)}` : ""}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-600 ring-1 ring-slate-200">
          {property.status}
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-semibold text-slate-700">Leads received</span>
          <span className="font-bold text-slate-800">
            {leadLimit === null ? (
              <>
                {leadsReceived} <span className="font-medium text-slate-400">· Unlimited</span>
              </>
            ) : (
              <>
                {leadsReceived} <span className="font-medium text-slate-400">of {leadLimit}</span>
              </>
            )}
          </span>
        </div>
        {leadLimit !== null ? (
          <div
            role="progressbar"
            aria-label="Leads received"
            aria-valuemin={0}
            aria-valuemax={leadLimit}
            aria-valuenow={Math.min(leadsReceived, leadLimit)}
            className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100"
          >
            <div className={`h-full rounded-full transition-all ${isLimitReached ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${usedPercent}%` }} />
          </div>
        ) : null}
      </div>

      {isLimitReached ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200">
          <p className="text-sm font-medium text-amber-900">
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
    <ul className="space-y-3">
      {properties.map((property) => (
        <UsageItem key={property.id} property={property} isLeadPackAvailable={isLeadPackAvailable} onBuyLeads={onBuyLeads} />
      ))}
    </ul>
  );
}
