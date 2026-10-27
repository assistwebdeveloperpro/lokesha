export default function PropertyCardSkeleton() {
  return (
    <div
      className="animate-pulse overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_3px_rgba(15,23,42,.08)]"
      aria-hidden="true"
    >
      <div className="aspect-16/10 bg-slate-200" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-3/4 rounded bg-slate-200" />
        <div className="h-4 w-1/2 rounded bg-slate-100" />
        <div className="h-6 w-1/3 rounded bg-slate-200" />
        <div className="flex gap-2 pt-2">
          <div className="h-10 flex-1 rounded-xl bg-slate-100" />
          <div className="h-10 flex-1 rounded-xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
