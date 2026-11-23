import { CalendarClock, Layers, ListChecks, Ticket } from "lucide-react";
import type { ComponentType } from "react";
import type { SubscriptionOverview } from "@/services/userSubscription.service";
import { formatDate, formatDaysLeft } from "./subscriptionShared";

type Tile = { label: string; value: string; hint?: string; Icon: ComponentType<{ className?: string }>; accent: string; isDate?: boolean };

export default function CreditSummaryTiles({ summary }: { summary: SubscriptionOverview["summary"] }) {
  const tiles: Tile[] = [
    { label: "Credits left", value: String(summary.remainingCredits), hint: "Listings you can publish", Icon: Ticket, accent: "bg-sky-50 text-sky-600" },
    { label: "Credits used", value: String(summary.usedCredits), hint: `of ${summary.totalCredits} in total`, Icon: ListChecks, accent: "bg-emerald-50 text-emerald-600" },
    { label: "In review", value: String(summary.reservedCredits), hint: "Held for pending listings", Icon: Layers, accent: "bg-amber-50 text-amber-600" },
    {
      label: "Next ending",
      value: summary.nextEndsAt ? formatDate(summary.nextEndsAt) : "—",
      hint: summary.nextEndsAt ? formatDaysLeft(summary.daysLeft) : "No paid plan running",
      Icon: CalendarClock,
      accent: "bg-slate-100 text-slate-600",
      isDate: true,
    },
  ];

  return (
    <dl className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {tiles.map(({ label, value, hint, Icon, accent, isDate }) => (
        <div key={label} className="min-w-0 rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-sm sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <dt className="min-w-0 text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</dt>
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${accent}`}>
              <Icon className="h-4 w-4" aria-hidden />
            </span>
          </div>
          <dd
            className={`mt-2 font-display font-bold tabular-nums text-slate-800 ${
              isDate ? "text-base sm:text-lg" : "text-xl sm:text-2xl"
            }`}
          >
            {value}
          </dd>
          {hint ? <p className="mt-1 text-xs font-medium text-slate-500">{hint}</p> : null}
        </div>
      ))}
    </dl>
  );
}
