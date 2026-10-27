import type { ReactNode } from "react";

const GRID_CLASS_NAME =
  "property-filter-grid grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3";

type PropertyFilterGridProps = {
  replayKey: string;
  children: ReactNode;
  isBusy?: boolean;
  variant?: "list" | "skeleton";
};

export function PropertyFilterEmpty({ replayKey, children }: { replayKey: string; children: ReactNode }) {
  return (
    <div key={replayKey} className="property-filter-empty">
      {children}
    </div>
  );
}

export default function PropertyFilterGrid({
  replayKey,
  children,
  isBusy = false,
  variant = "list",
}: PropertyFilterGridProps) {
  const className =
    variant === "skeleton" ? `${GRID_CLASS_NAME} property-filter-grid--skeleton` : GRID_CLASS_NAME;

  return (
    <div key={replayKey} className={className} aria-busy={isBusy || undefined}>
      {children}
    </div>
  );
}
