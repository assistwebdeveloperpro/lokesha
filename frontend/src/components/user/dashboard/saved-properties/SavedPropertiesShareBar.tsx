"use client";

import { Share2 } from "lucide-react";

type SavedPropertiesShareBarProps = {
  selectedCount: number;
  onSelectAll: () => void;
  onClear: () => void;
  onCancel: () => void;
  onShare: () => void;
};

const LINK_BUTTON_CLASS_NAME =
  "cursor-pointer text-sm font-semibold text-sky-700 transition hover:text-sky-900 disabled:cursor-not-allowed disabled:text-slate-400";

export default function SavedPropertiesShareBar({
  selectedCount,
  onSelectAll,
  onClear,
  onCancel,
  onShare,
}: SavedPropertiesShareBarProps) {
  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="text-sm font-semibold text-slate-800" aria-live="polite">
          {selectedCount} selected
        </p>
        <button type="button" onClick={onSelectAll} className={LINK_BUTTON_CLASS_NAME}>
          Select All
        </button>
        <button type="button" onClick={onClear} disabled={selectedCount === 0} className={LINK_BUTTON_CLASS_NAME}>
          Clear Selection
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="min-h-10 cursor-pointer rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onShare}
          disabled={selectedCount === 0}
          className="bg-linear-to-r-navy-blue inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white shadow-md transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Share2 className="h-4 w-4" aria-hidden />
          Share{selectedCount > 0 ? ` (${selectedCount})` : ""}
        </button>
      </div>
    </div>
  );
}
