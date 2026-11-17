import { CalendarClock, CheckCircle2, Handshake, PhoneCall, type LucideIcon } from "lucide-react";
import type { ContactedPropertiesSummary as Summary } from "@/services/userContactedProperties.service";

type SummaryTile = {
  key: keyof Summary;
  label: string;
  icon: LucideIcon;
  iconWrap: string;
  iconColor: string;
};

const SUMMARY_TILES: SummaryTile[] = [
  { key: "total", label: "Properties contacted", icon: Handshake, iconWrap: "bg-sky-50", iconColor: "text-sky-600" },
  { key: "available", label: "Still available", icon: CheckCircle2, iconWrap: "bg-emerald-50", iconColor: "text-emerald-600" },
  { key: "phonesRevealed", label: "Phones unlocked", icon: PhoneCall, iconWrap: "bg-violet-50", iconColor: "text-violet-600" },
  { key: "thisWeek", label: "Contacted this week", icon: CalendarClock, iconWrap: "bg-amber-50", iconColor: "text-amber-600" },
];

const tileClassName =
  "flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm";

// summary is null while the first load is in flight
export default function ContactedPropertiesSummary({ summary }: { summary: Summary | null }) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy={!summary}>
      {SUMMARY_TILES.map(({ key, label, icon: Icon, iconWrap, iconColor }) => (
        <div key={key} className={tileClassName}>
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconWrap}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0">
            {summary ? (
              <p className="text-xl font-bold tabular-nums text-slate-900">{summary[key]}</p>
            ) : (
              <div className="h-6 w-10 animate-pulse rounded bg-slate-200/80" />
            )}
            <p className="mt-0.5 truncate text-xs font-medium text-slate-500">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
