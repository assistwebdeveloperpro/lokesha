function NewlyLaunchedInfoRowSkeleton({ widthClassName }: { widthClassName: string }) {
  return (
    <li className="flex items-center gap-2.5">
      <div className="h-4 w-4 shrink-0 rounded bg-slate-200" />
      <div className={`h-3.5 rounded bg-slate-200 ${widthClassName}`} />
    </li>
  );
}

export function NewlyLaunchedCardSkeleton() {
  return (
    <div
      aria-hidden
      className="flex h-full animate-pulse flex-col overflow-hidden rounded-3xl bg-white pb-4"
    >
      <div className="relative aspect-video w-full shrink-0 bg-slate-200">
        <div className="absolute right-4 top-4 h-8 w-36 rounded-lg bg-slate-300" />
      </div>

      <div className="relative z-10 mx-4 mt-[-10%] rounded-2xl bg-white p-4 ">
        <div className="space-y-2">
          <div className="h-5 w-3/5 rounded bg-slate-300" />
          <div className="h-3 w-2/5 rounded bg-slate-200" />
        </div>

        <div className="my-3 h-px w-full bg-slate-200" />

        <ul className="space-y-2.5">
          <NewlyLaunchedInfoRowSkeleton widthClassName="w-2/5" />
          <NewlyLaunchedInfoRowSkeleton widthClassName="w-3/5" />
        </ul>

        <div className="mt-3 h-5 w-1/2 rounded bg-slate-300" />
      </div>
    </div>
  );
}
