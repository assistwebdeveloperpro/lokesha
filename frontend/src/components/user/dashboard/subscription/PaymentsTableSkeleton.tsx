import { PAYMENT_GRID_CLASS, PAYMENT_TABLE_COLUMNS, PAYMENT_TABLE_MIN_WIDTH_CLASS } from "./paymentsTableLayout";

const ROW_COUNT = 5;

const bar = "animate-pulse rounded bg-slate-200/80";

export default function PaymentsTableSkeleton() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-sm scrollbar-hidden" aria-busy>
      <div className={PAYMENT_TABLE_MIN_WIDTH_CLASS}>
        <div
          className={`border-b border-slate-200 bg-slate-50 px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 ${PAYMENT_GRID_CLASS}`}
          aria-hidden
        >
          {PAYMENT_TABLE_COLUMNS.map((column) => (
            <span key={column}>{column}</span>
          ))}
        </div>
        <ul aria-hidden>
          {Array.from({ length: ROW_COUNT }, (_, index) => (
            <li key={index} className={`border-b border-slate-100 px-4 py-4 last:border-b-0 sm:px-5 ${PAYMENT_GRID_CLASS}`}>
              <div className="space-y-2">
                <div className={`${bar} h-4 w-3/4`} />
                <div className={`${bar} h-3 w-1/2`} />
              </div>
              <div className="space-y-2">
                <div className={`${bar} h-4 w-2/3`} />
                <div className={`${bar} h-3 w-1/2`} />
              </div>
              <div className="space-y-2">
                <div className={`${bar} h-4 w-16`} />
                <div className={`${bar} h-3 w-24`} />
              </div>
              <div className={`${bar} h-6 w-16 rounded-full`} />
              <div className={`${bar} h-9 w-20 rounded-lg`} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
