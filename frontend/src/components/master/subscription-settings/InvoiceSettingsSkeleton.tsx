const bar = "animate-pulse rounded bg-slate-200/80";

function SectionSkeleton({ fieldCount, hasTextarea = false }: { fieldCount: number; hasTextarea?: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6">
      <div className={`${bar} h-5 w-40`} />
      <div className={`${bar} mt-2 h-3 w-64`} />
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {Array.from({ length: fieldCount }, (_, index) => (
          <div key={index} className={`${bar} h-14 w-full rounded-xl`} />
        ))}
        {hasTextarea ? <div className={`${bar} h-24 w-full rounded-xl sm:col-span-2`} /> : null}
      </div>
    </div>
  );
}

export default function InvoiceSettingsSkeleton() {
  return (
    <div className="space-y-6" aria-busy aria-hidden>
      <div className={`${bar} h-16 w-full rounded-2xl`} />
      <SectionSkeleton fieldCount={3} hasTextarea />
      <SectionSkeleton fieldCount={2} />
      <div className="flex justify-end">
        <div className={`${bar} h-11 w-36 rounded-xl`} />
      </div>
    </div>
  );
}
