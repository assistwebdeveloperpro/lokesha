export function LimelightCardSkeleton() {
  return (
    <div aria-hidden className="h-full animate-pulse rounded-3xl border border-slate-200 bg-white p-3 shadow-xs">
      <div className="flex h-full flex-col gap-3 md:flex-row md:gap-4">
        <div className="aspect-16/10 w-full shrink-0 rounded-2xl bg-slate-200 md:aspect-auto md:min-h-96 md:w-[40%]" />

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-5 px-1 pb-1 md:py-3 md:pr-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="min-w-0 flex-1 space-y-2.5">
              <div className="h-6 w-3/5 rounded bg-slate-300" />
              <div className="h-4 w-2/5 rounded bg-slate-200" />
            </div>
            <div className="h-6 w-32 rounded bg-slate-300" />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="flex flex-col items-start gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-2.5 sm:flex-row sm:items-center sm:gap-3 sm:p-3"
              >
                <div className="h-8 w-8 shrink-0 rounded-xl bg-slate-200 sm:h-9 sm:w-9" />
                <div className="w-full flex-1 space-y-2">
                  <div className="h-3 w-16 rounded bg-slate-200" />
                  <div className="h-4 w-20 rounded bg-slate-300" />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <div className="flex flex-1 items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-full bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/2 rounded bg-slate-300" />
                <div className="h-3 w-16 rounded bg-slate-200" />
              </div>
            </div>
            <div className="h-10 w-10 shrink-0 rounded-full bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
