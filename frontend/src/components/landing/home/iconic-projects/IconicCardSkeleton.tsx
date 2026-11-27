export function IconicCardSkeleton() {
  return (
    <div aria-hidden className="relative h-80 animate-pulse overflow-hidden rounded-3xl bg-slate-200 md:h-104">
      <div className="absolute right-4 top-4 h-7 w-28 rounded-full bg-slate-300" />

      <div className="absolute inset-x-0 bottom-0 space-y-2 p-5 md:p-6">
        <div className="h-3 w-1/4 rounded bg-slate-300" />
        <div className="h-6 w-3/5 rounded bg-slate-300 md:h-7" />
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="h-4 w-2/5 rounded bg-slate-300" />
          <div className="h-5 w-24 rounded bg-slate-300" />
        </div>
      </div>
    </div>
  );
}
