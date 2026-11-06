import { Mail, MapPin, Phone } from "lucide-react";
import type { AdminLead } from "@/services/adminLeads.service";
import LeadStatusBadge from "./LeadStatusBadge";
import {
  CONTACT_ROLE_LABEL,
  formatAbsoluteTime,
  formatRelativeTime,
  getInitials,
  LEAD_GRID_CLASS,
  LEAD_TABLE_COLUMNS,
  LEAD_TABLE_MIN_WIDTH_CLASS,
  LISTED_BY_LABEL,
} from "./leadsShared";

const LISTING_TYPE_LABEL: Record<string, string> = { sale: "Sale", "rent-lease": "Rent / Lease" };

const chipClassName =
  "inline-flex w-fit items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold capitalize text-slate-600";

function LeadRow({ lead }: { lead: AdminLead }) {
  const { property, lister } = lead;

  return (
    <li
      className={`grid gap-4 border-b border-slate-100 px-4 py-4 transition last:border-b-0 hover:bg-sky-50/40 sm:px-5 ${LEAD_GRID_CLASS}`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span
          className="bg-linear-to-r-navy-blue flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
          aria-hidden
        >
          {getInitials(lead.lead.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{lead.lead.name}</p>
          {lead.lead.mobile ? (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
              <Phone className="h-3 w-3 shrink-0" aria-hidden />
              {lead.lead.mobile}
            </p>
          ) : null}
          {lead.lead.email ? (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
              <Mail className="h-3 w-3 shrink-0" aria-hidden />
              <span className="truncate">{lead.lead.email}</span>
            </p>
          ) : null}
        </div>
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900" title={property.title}>
          {property.title}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">Listing #{property.listingNumber}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className={chipClassName}>{property.propertyType}</span>
          <span className={chipClassName}>{LISTING_TYPE_LABEL[property.listingType] ?? property.listingType}</span>
        </div>
        <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-500">
          <MapPin className="h-3 w-3 shrink-0" aria-hidden />
          <span className="truncate">{[property.locality, property.city].filter(Boolean).join(", ")}</span>
        </p>
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900">{lister.name ?? "—"}</p>
        {lister.mobile ? <p className="mt-0.5 text-xs text-slate-500">{lister.mobile}</p> : null}
        {lister.listedBy ? (
          <span className={`${chipClassName} mt-1.5`}>{LISTED_BY_LABEL[lister.listedBy] ?? lister.listedBy}</span>
        ) : null}
      </div>

      <div className="min-w-0">
        <span className="inline-flex w-fit rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 ring-1 ring-sky-200">
          {CONTACT_ROLE_LABEL[lead.contactRole]}
        </span>
        <p className={`mt-1.5 text-xs font-medium ${lead.phoneRevealed ? "text-emerald-600" : "text-slate-500"}`}>
          {lead.phoneRevealed ? "Phone shared" : "Phone hidden"}
        </p>
      </div>

      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-800">{formatRelativeTime(lead.createdAt)}</p>
        <p className="mt-0.5 text-xs text-slate-500">{formatAbsoluteTime(lead.createdAt)}</p>
      </div>

      <div className="min-w-0">
        <LeadStatusBadge status={lead.verificationStatus} />
      </div>
    </li>
  );
}

export default function LeadsTable({ leads }: { leads: AdminLead[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-sm">
      <div className={LEAD_TABLE_MIN_WIDTH_CLASS}>
        <div
          className={`border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${LEAD_GRID_CLASS}`}
          aria-hidden
        >
          {LEAD_TABLE_COLUMNS.map((column) => (
            <span key={column}>{column}</span>
          ))}
        </div>
        <ul>
          {leads.map((lead) => (
            <LeadRow key={lead.id} lead={lead} />
          ))}
        </ul>
      </div>
    </div>
  );
}
