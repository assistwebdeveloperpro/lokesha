export default function BhkTabList({
  bhks,
  activeBhk,
  onSelect,
  label,
}: {
  bhks: string[];
  activeBhk: string;
  onSelect: (bhk: string) => void;
  label: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex w-full min-w-0 flex-nowrap gap-1.5 overflow-x-auto overscroll-x-contain rounded-2xl bg-slate-100 p-1.5 ring-1 ring-slate-200/90 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
    >
      {bhks.map((bhk) => (
        <button
          key={bhk}
          type="button"
          role="tab"
          aria-selected={bhk === activeBhk}
          onClick={() => onSelect(bhk)}
          className={`inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${
            bhk === activeBhk
              ? "bg-sky-600 text-white shadow-md shadow-sky-600/25"
              : "text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm"
          }`}
        >
          {bhk}
        </button>
      ))}
    </div>
  );
}
