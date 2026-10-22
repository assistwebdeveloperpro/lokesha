import type { ReactNode } from "react";

export type SubTypeTab = { id: string; label: string };

export default function SubTypeDetailsTabs({
  tabs,
  activeId,
  onActiveChange,
  errorIds,
  children,
}: {
  tabs: SubTypeTab[];
  activeId: string;
  onActiveChange: (id: string) => void;
  errorIds: string[];
  children: ReactNode;
}) {
  const focusTab = (index: number) => {
    const next = tabs[(index + tabs.length) % tabs.length];
    onActiveChange(next.id);
    document.getElementById(`subTypeTab-${next.id}`)?.focus();
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Sub type details"
        className="flex gap-2 overflow-x-auto border-b border-slate-200 pb-px"
      >
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeId;
          const hasError = errorIds.includes(tab.id);

          return (
            <button
              key={tab.id}
              id={`subTypeTab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`subTypePanel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onActiveChange(tab.id)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight") focusTab(index + 1);
                if (event.key === "ArrowLeft") focusTab(index - 1);
              }}
              className={`relative -mb-px inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-t-xl border border-b-0 px-4 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? "border-slate-200 bg-white text-sky-800"
                  : "border-transparent bg-slate-50 text-slate-600 hover:text-sky-700"
              }`}
            >
              {tab.label}
              {hasError ? (
                <span
                  className="h-2 w-2 rounded-full bg-red-500"
                  title="Has errors"
                  aria-label="Has errors"
                />
              ) : null}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`subTypePanel-${activeId}`}
        aria-labelledby={`subTypeTab-${activeId}`}
        className="pt-5"
      >
        {children}
      </div>
    </div>
  );
}
