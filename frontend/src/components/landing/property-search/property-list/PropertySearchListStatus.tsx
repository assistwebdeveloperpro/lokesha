import { TriangleAlert } from "lucide-react";

const SKELETON_COUNT = 4;

const MESSAGE_BOX =
  "flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm";

function PropertySearchListingCardSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse overflow-hidden rounded-2xl border bg-white shadow-sm ${
        featured ? "border-sky-200 ring-1 ring-sky-100" : "border-slate-200"
      }`}
    >
      <div className="flex flex-col lg:flex-row">
        <div className="relative aspect-16/10 w-full shrink-0 bg-slate-200 lg:aspect-auto lg:min-h-60 lg:w-[38%] lg:max-w-88">
          <div className="absolute left-3 top-3 flex gap-1.5">
            {featured ? <div className="h-5 w-16 rounded-full bg-sky-300" /> : null}
            <div className="h-5 w-14 rounded-full bg-white" />
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-slate-400/70 to-transparent px-3 pb-3 pt-10 sm:px-4 sm:pb-4">
            <div className="h-2.5 w-28 rounded bg-white/80" />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
          <div className="space-y-2">
            <div className="h-6 w-4/5 rounded-md bg-slate-300 sm:h-7" />
            <div className="h-4 w-full rounded bg-slate-200" />
            <div className="h-4 w-2/3 rounded bg-slate-200" />
          </div>

          <div className="mt-2 h-6 w-40 rounded-md bg-slate-300" />

          <div className="mt-3 flex flex-wrap gap-2">
            <div className="h-8 w-20 rounded-lg bg-slate-200" />
            <div className="h-8 w-28 rounded-lg bg-slate-200" />
            <div className="h-8 w-36 rounded-lg bg-slate-200" />
          </div>

          <div className="mt-auto w-full min-w-0 pt-4">
            <div className="flex w-full min-w-0 flex-wrap items-center gap-3 border-t border-slate-200 pt-4">
              <div className="flex min-w-0 items-center gap-2">
                <div className="h-9 w-9 shrink-0 rounded-xl bg-slate-200" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-32 rounded bg-slate-300" />
                  <div className="h-3 w-40 rounded bg-slate-200" />
                </div>
              </div>
              <div className="ml-auto flex w-full items-center gap-2 sm:w-auto">
                <div className="h-10 w-10 rounded-xl bg-slate-200" />
                <div className="h-10 w-10 rounded-xl bg-slate-200" />
                <div className="h-10 w-32 rounded-xl bg-slate-300" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PropertySearchListSkeleton() {
  return (
    <ul aria-busy="true" aria-label="Loading properties" className="space-y-4 sm:space-y-5">
      {Array.from({ length: SKELETON_COUNT }, (_, index) => (
        <li key={index}>
          <PropertySearchListingCardSkeleton featured={index === 0} />
        </li>
      ))}
    </ul>
  );
}

type PropertySearchListErrorProps = {
  message: string;
  onRetry: () => void;
};

export function PropertySearchListError({ message, onRetry }: PropertySearchListErrorProps) {
  return (
    <div role="alert" className={MESSAGE_BOX}>
      <TriangleAlert className="h-8 w-8 text-amber-500" aria-hidden />
      <p className="text-sm font-medium text-slate-700">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="cursor-pointer rounded-full bg-navy-blue px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}

export { PropertySearchEmptyState } from "./PropertySearchEmptyState";
