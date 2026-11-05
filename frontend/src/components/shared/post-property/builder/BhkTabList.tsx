export type BhkTabListItem = { key: string; label: string };

export default function BhkTabList({
  tabs,
  activeKey,
  onSelect,
  label,
}: {
  tabs: BhkTabListItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  label: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex w-full min-w-0 flex-nowrap gap-1.5 overflow-x-auto overscroll-x-contain rounded-2xl bg-slate-100 p-1.5 ring-1 ring-slate-200/90 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={tab.key === activeKey}
          aria-label={tab.key}
          title={tab.key}
          onClick={() => onSelect(tab.key)}
          className={`inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${
            tab.key === activeKey
              ? "bg-sky-600 text-white shadow-md shadow-sky-600/25"
              : "text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
