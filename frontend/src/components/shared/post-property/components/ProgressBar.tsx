export default function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="flex w-full flex-1 items-center gap-4">
      <div
        className="h-3.5 flex-1 overflow-hidden rounded-full bg-slate-200/80 shadow-inner"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Form completion progress"
      >
        <div
          className="bg-linear-to-r-progress h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="shrink-0 rounded-lg bg-navy-blue/5 px-2.5 py-1 text-sm font-bold text-navy-blue">
        {percent}%
      </span>
    </div>
  );
}
