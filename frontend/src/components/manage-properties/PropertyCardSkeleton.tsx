export default function PropertyCardSkeleton() {
  return (
    <div
      aria-hidden
      className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white"
    >
      <div className="aspect-16/10 bg-slate-200" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-2/3 rounded bg-slate-200" />
        <div className="h-4 w-1/2 rounded bg-slate-100" />
        <div className="h-6 w-1/3 rounded bg-slate-200" />
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="h-10 rounded-xl bg-slate-100" />
          <div className="h-10 rounded-xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
