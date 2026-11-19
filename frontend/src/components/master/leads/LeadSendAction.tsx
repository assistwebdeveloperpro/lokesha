import { CheckCheck, Loader2, Send } from "lucide-react";
import type { AdminLead } from "@/services/adminLeads.service";
import { formatRelativeTime, getLeadSendState } from "./leadsShared";

type LeadSendActionProps = {
  lead: AdminLead;
  isSending: boolean;
  isDisabled: boolean;
  error?: string;
  onSend: (id: string) => void;
};

export default function LeadSendAction({ lead, isSending, isDisabled, error, onSend }: LeadSendActionProps) {
  const state = getLeadSendState(lead);

  if (state === "none") return null;

  if (state === "no_account") {
    return <p className="text-xs font-medium text-slate-400">Posted by admin</p>;
  }

  if (state === "sent") {
    return (
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-200">
          <CheckCheck className="h-3.5 w-3.5" aria-hidden />
          Sent to lister
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
