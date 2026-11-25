import { Building2, Hash, Mail, MapPin, Phone } from "lucide-react";
import { useEffect, useRef } from "react";
import type { AdminLead } from "@/services/adminLeads.service";
import LeadSendAction from "./LeadSendAction";
import LeadStatusBadge from "./LeadStatusBadge";
import {
  formatAbsoluteTime,
  formatRelativeTime,
  getInitials,
  HIGHLIGHT_ROW_CLASS,
  LEAD_GRID_CLASS,
  LEAD_TABLE_COLUMNS,
  LEAD_TABLE_MIN_WIDTH_CLASS,
  LISTED_BY_LABEL,
} from "./leadsShared";

const LISTING_TYPE_LABEL: Record<string, string> = { sale: "Sale", "rent-lease": "Rent / Lease" };

const LISTING_TYPE_STYLE: Record<string, string> = {
  sale: "bg-amber-50 text-amber-700 ring-amber-200",
  "rent-lease": "bg-violet-50 text-violet-700 ring-violet-200",
};

const DEFAULT_LISTING_TYPE_STYLE = "bg-slate-100 text-slate-600 ring-slate-200/70";

const chipClassName =
  "inline-flex w-fit items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold capitalize text-slate-600 ring-1 ring-slate-200/70";

const iconBubbleClassName = (tone: string) =>
  `flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${tone}`;

type LeadSendProps = {
  sendingId: string | null;
  sendError: { id: string; message: string } | null;
  onSend: (id: string) => void;
};

function LeadRow({
  lead,
  isHighlighted,
  sendingId,
  sendError,
  onSend,
}: { lead: AdminLead; isHighlighted: boolean } & LeadSendProps) {
  const rowRef = useRef<HTMLLIElement>(null);
  const { property, lister } = lead;

  useEffect(() => {
    if (isHighlighted) rowRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [isHighlighted]);

  return (
    <li
      ref={rowRef}
      className={`grid gap-4 border-b border-slate-100 px-5 py-4 transition last:border-b-0 sm:px-5 ${
        isHighlighted ? HIGHLIGHT_ROW_CLASS : "hover:bg-slate-50"
      } ${LEAD_GRID_CLASS}`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span
          className="bg-linear-to-r-navy-blue flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white shadow-md ring-2 ring-white"
          aria-hidden
        >
          {getInitials(lead.lead.name)}
        </span>
        <div className="min-w-0 space-y-1.5">
          <p className="truncate text-sm font-bold text-slate-900">{lead.lead.name}</p>
          {lead.lead.mobile ? (
            <p className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <span className={iconBubbleClassName("bg-emerald-50 text-emerald-600")}>
                <Phone className="h-3 w-3" aria-hidden />
              </span>
              {lead.lead.mobile}
            </p>
          ) : null}
          {lead.lead.email ? (
            <p className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <span className={iconBubbleClassName("bg-sky-50 text-sky-600")}>
                <Mail className="h-3 w-3" aria-hidden />
              </span>
              <span className="truncate" title={lead.lead.email}>
                {lead.lead.email}
              </span>
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex min-w-0 items-start gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-50 to-sky-100 text-indigo-600 ring-1 ring-indigo-100"
          aria-hidden
        >
          <Building2 className="h-5 w-5" />
        </span>
        <div className="min-w-0 space-y-1.5">
          <p className="truncate text-sm font-bold text-slate-900" title={property.title}>
            {property.title}
          </p>
          <div className="flex flex-nowrap items-center gap-1.5 whitespace-nowrap">
            <span className="inline-flex items-center gap-0.5 rounded-md bg-slate-900 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-white">
              <Hash className="h-2.5 w-2.5" aria-hidden />
              {property.listingNumber}
            </span>
            <span className={chipClassName}>{property.propertyType}</span>
            <span
              className={`${chipClassName} ${LISTING_TYPE_STYLE[property.listingType] ?? DEFAULT_LISTING_TYPE_STYLE}`}
            >
              {LISTING_TYPE_LABEL[property.listingType] ?? property.listingType}
            </span>
          </div>
          <p className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <span className={iconBubbleClassName("bg-rose-50 text-rose-500")}>
              <MapPin className="h-3 w-3" aria-hidden />
            </span>
            <span className="truncate">{[property.locality, property.city].filter(Boolean).join(", ")}</span>
          </p>
        </div>
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900">{lister.name ?? "—"}</p>
        {lister.mobile ? <p className="mt-0.5 text-xs text-slate-500">{lister.mobile}</p> : null}
        {lister.listedBy ? (
          <span className={`${chipClassName} mt-1.5`}>{LISTED_BY_LABEL[lister.listedBy] ?? lister.listedBy}</span>
        ) : null}
      </div>

      <div className="min-w-0">
        <p className={`text-xs font-medium ${lead.phoneRevealed ? "text-emerald-600" : "text-slate-500"}`}>
          {lead.phoneRevealed ? "Lister phone shared" : "Lister phone hidden"}
        </p>
      </div>

      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-800">{formatRelativeTime(lead.createdAt)}</p>
        <p className="mt-0.5 text-xs text-slate-500">{formatAbsoluteTime(lead.createdAt)}</p>
      </div>

      <div className="min-w-0">
        <LeadStatusBadge status={lead.verificationStatus} />
      </div>

      <div className="min-w-0">
        <LeadSendAction
          lead={lead}
          isSending={sendingId === lead.id}
          isDisabled={sendingId !== null}
          error={sendError?.id === lead.id ? sendError.message : undefined}
          onSend={onSend}
        />
      </div>
    </li>
  );
}

type LeadsTableProps = { leads: AdminLead[]; highlightLeadId: string | null } & LeadSendProps;

export default function LeadsTable({ leads, highlightLeadId, sendingId, sendError, onSend }: LeadsTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/90 scrollbar-hidden bg-white shadow-sm">
      <div className={LEAD_TABLE_MIN_WIDTH_CLASS}>
        <div
          className={`border-b border-slate-200 bg-slate-50 px-5 py-3.5 text-[11.5px] font-bold uppercase tracking-wider text-slate-600 ${LEAD_GRID_CLASS}`}
          aria-hidden
        >
          {LEAD_TABLE_COLUMNS.map((column) => (
            <span key={column}>{column}</span>
          ))}
        </div>
        <ul>
          {leads.map((lead) => (
            <LeadRow
              key={lead.id}
              lead={lead}
              isHighlighted={lead.id === highlightLeadId}
              sendingId={sendingId} sendError={sendError} onSend={onSend} />
          ))}
        </ul>
      </div>
    </div>
  );
}
