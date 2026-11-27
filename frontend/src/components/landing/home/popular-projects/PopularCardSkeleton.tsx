function PopularDetailRowSkeleton() {
  return (
    <li className="flex items-center gap-3">
      <div className="h-9 w-9 shrink-0 rounded-xl bg-slate-200" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="h-2.5 w-1/4 rounded bg-slate-200" />
        <div className="h-4 w-3/5 rounded bg-slate-300" />
      </div>
    </li>
  );
}

export function PopularCardSkeleton() {
  return (
    <div
      aria-hidden
      className="flex h-full animate-pulse flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white"
    >
      <div className="aspect-4/3 w-full shrink-0 bg-slate-200" />

      <div className="flex flex-1 flex-col p-5">
        <div className="space-y-2">
          <div className="h-5 w-3/5 rounded bg-slate-300" />
          <div className="h-3 w-2/5 rounded bg-slate-200" />
        </div>

        <div className="my-4 h-px w-full bg-slate-200" />

        <ul className="space-y-3.5">
          <PopularDetailRowSkeleton />
          <PopularDetailRowSkeleton />
          <PopularDetailRowSkeleton />
        </ul>
      </div>
    </div>
  );
}
