import { CheckCheck, Clock, Loader2, Lock, Send } from "lucide-react";
import type { AdminLead } from "@/services/adminLeads.service";
import { LEAD_LIMIT_REACHED_LABEL, LEAD_LIMIT_REACHED_MESSAGE, formatRelativeTime, getLeadSendState } from "./leadsShared";

type LeadSendActionProps = {
  lead: AdminLead;
  isSending: boolean;
  isDisabled: boolean;
  error?: string;
  onSend: (id: string) => void;
};

export default function LeadSendAction({ lead, isSending, isDisabled, error, onSend }: LeadSendActionProps) {
  const state = getLeadSendState(lead);

  if (state === "not_verified") {
    return (
      <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
        <Clock className="h-3.5 w-3.5" aria-hidden />
        Lead Not Sent to Owner
      </span>
    );
  }

  if (state === "no_account") {
    return <p className="text-xs font-medium text-slate-400">Posted by admin</p>;
  }

  if (state === "limit_reached") {
    return (
      <div className="group relative inline-block">
        <button
          type="button"
          disabled
          aria-describedby={`lead-limit-${lead.id}`}
          className="inline-flex min-h-9 cursor-not-allowed items-center gap-1.5 whitespace-nowrap rounded-xl bg-slate-200 px-3 text-xs font-semibold text-slate-500"
        >
          <Lock className="h-3.5 w-3.5" aria-hidden />
          {LEAD_LIMIT_REACHED_LABEL}
        </button>
        <span
          id={`lead-limit-${lead.id}`}
          role="tooltip"
          className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 w-60 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
        >
          {LEAD_LIMIT_REACHED_MESSAGE}
        </span>
      </div>
    );
  }

  if (state === "sent") {
    return (
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-200">
          <CheckCheck className="h-3.5 w-3.5" aria-hidden />
          Lead Sent to Owner
        </span>
        {lead.sentAt ? <p className="text-xs text-slate-500">{formatRelativeTime(lead.sentAt)}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => onSend(lead.id)}
        disabled={isDisabled}
        className="bg-linear-to-r-navy-blue inline-flex min-h-9 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-xl px-3 text-xs font-semibold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        ) : (
          <Send className="h-3.5 w-3.5" aria-hidden />
        )}
        {isSending ? "Sending..." : "Assign Lead to Property Owner"}
      </button>
      {error ? (
        <p className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
