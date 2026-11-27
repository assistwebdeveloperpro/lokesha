export function FeaturedCardSkeleton() {
  return (
    <div
      aria-hidden
      className="flex h-full animate-pulse flex-col rounded-3xl border border-slate-200 bg-white p-3 shadow-xs md:min-h-104"
    >
      <div className="h-48 w-full shrink-0 rounded-2xl bg-slate-200 md:h-60" />

      <div className="flex flex-1 flex-col justify-between gap-4 px-1 md:px-4 pb-1 pt-4">
        <div className="flex items-start justify-between gap-3 pt-2">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-5 w-3/5 rounded bg-slate-300 md:h-6" />
            <div className="h-4 w-2/5 rounded bg-slate-200" />
          </div>
          <div className="h-5 w-24 rounded bg-slate-300" />
        </div>

        <div className="flex flex-col items-start gap-2 border-t border-slate-100 pt-4 md:min-h-14 md:flex-row md:items-center md:justify-between md:gap-3">
          <div className="h-4 w-2/5 rounded bg-slate-200" />
          <div className="h-4 w-1/4 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
