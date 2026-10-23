import { Check } from "lucide-react";
import type { ReactNode } from "react";

export type SubTypeTab = { id: string; label: string };

export default function SubTypeDetailsTabs({
  tabs,
  activeId,
  onActiveChange,
  errorIds,
  title,
  description,
  children,
}: {
  tabs: SubTypeTab[];
  activeId: string;
  onActiveChange: (id: string) => void;
  errorIds: string[];
  title: string;
  description: string;
  children: ReactNode;
}) {
  const activeTab = tabs.find((tab) => tab.id === activeId);

  const focusTab = (index: number) => {
    const next = tabs[(index + tabs.length) % tabs.length];
    onActiveChange(next.id);
    document.getElementById(`subTypeTab-${next.id}`)?.focus();
  };

  return (
    <div className="min-w-0 rounded-xl border border-slate-300">
      <div className="p-3 sm:p-4">
        <div className="mb-4">
          <h3 className="font-display text-base font-bold text-slate-800 sm:text-lg">
            {title}
          </h3>
          <p className="mt-1 text-sm font-medium leading-relaxed text-slate-500">
            {description}
          </p>
        </div>
        <div
          role="tablist"
          aria-label={title}
          className="flex w-full min-w-0 flex-nowrap gap-1.5 overflow-x-auto overscroll-x-contain rounded-2xl bg-slate-100 p-1.5 ring-1 ring-slate-200/90 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                  if (event.key === "ArrowRight") {
                    event.preventDefault();
                    focusTab(index + 1);
                  }
                  if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    focusTab(index - 1);
                  }
                  if (event.key === "Home") {
                    event.preventDefault();
                    focusTab(0);
                  }
                  if (event.key === "End") {
                    event.preventDefault();
                    focusTab(tabs.length - 1);
                  }
                }}
                className={`inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${
                  isActive
                    ? "bg-sky-600 text-white shadow-md shadow-sky-600/25"
                    : "text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm"
                }`}
              >
                {isActive ? (
                  <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.75} aria-hidden />
                ) : null}
                <span className="text-left leading-snug">{tab.label}</span>
                {hasError ? (
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      isActive ? "bg-red-400 ring-2 ring-white/80" : "bg-red-500"
                    }`}
                    title="Has errors"
                    aria-label="Has errors"
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        {activeTab ? (
          <div className="mt-3 flex items-center gap-2.5 px-1">
            <span
              className="h-4 w-1 shrink-0 rounded-full bg-gradient-to-b from-sky-400 to-sky-600"
              aria-hidden
            />
            <p className="text-sm font-medium text-slate-500">
              Editing{" "}
              <span className="font-semibold text-slate-800">{activeTab.label}</span>
            </p>
          </div>
        ) : null}
      </div>

      <div
        role="tabpanel"
        id={`subTypePanel-${activeId}`}
        aria-labelledby={`subTypeTab-${activeId}`}
        className="border-t border-slate-300 p-4 sm:p-5"
      >
        {children}
      </div>
    </div>
  );
}
