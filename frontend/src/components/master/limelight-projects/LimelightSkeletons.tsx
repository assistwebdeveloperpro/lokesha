const bar = "animate-pulse rounded bg-slate-200/80";

export const LIMELIGHT_GRID_CLASS = "grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4";

function ProjectCardSkeleton({ hasCheckbox = false }: { hasCheckbox?: boolean }) {
  return (
    <li aria-hidden className="overflow-hidden rounded-2xl border-2 border-slate-200/90 bg-white shadow-sm">
      <div className={`${bar} aspect-16/10 w-full rounded-none`} />
      <div className="space-y-2.5 p-4">
        <div className={`${bar} h-5 w-3/4`} />
        <div className={`${bar} h-3.5 w-1/2`} />
        <div className={`${bar} h-3.5 w-2/5`} />
        <div className="flex items-center justify-between pt-1">
          <div className={`${bar} h-4 w-28`} />
          {hasCheckbox ? <div className={`${bar} h-5 w-5 rounded-md`} /> : <div className={`${bar} h-9 w-24 rounded-xl`} />}
        </div>
      </div>
    </li>
  );
}

export function LimelightResultsSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul aria-busy="true" aria-label="Loading projects" className={LIMELIGHT_GRID_CLASS}>
      {Array.from({ length: count }, (_, index) => (
        <ProjectCardSkeleton key={index} hasCheckbox />
      ))}
    </ul>
  );
}

export function LimelightEntriesSkeleton({ count = 4 }: { count?: number }) {
  return (
    <ul aria-busy="true" aria-label="Loading Limelight projects" className={LIMELIGHT_GRID_CLASS}>
      {Array.from({ length: count }, (_, index) => (
        <ProjectCardSkeleton key={index} />
      ))}
    </ul>
  );
}
