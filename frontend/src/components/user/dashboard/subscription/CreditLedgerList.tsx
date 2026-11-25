import type { LedgerEntry } from "@/services/userSubscription.service";
import { LEDGER_TONES, formatCreditChange, formatDateTimeWithSeconds } from "./subscriptionShared";

function LedgerRow({ entry }: { entry: LedgerEntry }) {
  const tone = LEDGER_TONES[entry.type];
  const isGain = entry.credits > 0;

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-slate-100 px-4 py-3.5 last:border-b-0 sm:px-5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
        {entry.step}
      </span>

      <span
        className={`flex h-10 w-12 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
          isGain ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700"
        }`}
      >
        {formatCreditChange(entry.credits)}
      </span>

      <div className="min-w-[180px] flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">
          {entry.property ? `${entry.property.title} (#${entry.property.listingNumber})` : (entry.reason ?? tone.label)}
        </p>
        <p className="text-xs font-medium text-slate-500">{formatDateTimeWithSeconds(entry.createdAt)}</p>
      </div>

      <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${tone.className}`}>{tone.label}</span>

      <div className="w-24 shrink-0 text-right">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Balance</p>
        <p className="text-sm font-bold text-slate-800">{entry.balanceAfter} left</p>
      </div>
    </li>
  );
}

export default function CreditLedgerList({ entries }: { entries: LedgerEntry[] }) {
  return (
    <ul className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
      {entries.map((entry) => (
        <LedgerRow key={entry.id} entry={entry} />
      ))}
    </ul>
  );
}
