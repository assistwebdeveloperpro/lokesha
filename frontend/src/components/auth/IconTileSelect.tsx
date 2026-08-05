"use client";

import { ChevronDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type IconTileDropdownOption = {
  id: string;
  label: string;
  icon?: LucideIcon;
};

export type IconTileOption = {
  id: string;
  label: string;
  icon: LucideIcon;
  hasDropdown?: boolean;
  dropdownOptions?: readonly IconTileDropdownOption[];
};

type IconTileSelectProps<T extends string> = {
  legend: string;
  name: string;
  options: readonly IconTileOption[];
  value: T[];
  onChange: (value: T[]) => void;
  columns?: 2 | 3 | 4 | 5;
  dropdownSelections?: string[];
  onDropdownSelectionsChange?: (selections: string[]) => void;
  dropdownDisplay?: "dropdown" | "tiles";
  error?: string;
};

export default function IconTileSelect<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
  columns = 2,
  dropdownSelections = [],
  onDropdownSelectionsChange,
  dropdownDisplay = "dropdown",
  error,
}: IconTileSelectProps<T>) {
  const useTileDropdown = dropdownDisplay === "tiles";
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const fieldsetRef = useRef<HTMLFieldSetElement>(null);

  const toggleDropdownSelection = (optionId: string) => {
    const next = dropdownSelections.includes(optionId)
      ? dropdownSelections.filter((id) => id !== optionId)
      : [...dropdownSelections, optionId];
    onDropdownSelectionsChange?.(next);
  };

  const handleTileClick = (option: IconTileOption) => {
    const isSelected = value.includes(option.id as T);

    if (isSelected) {
      onChange(value.filter((id) => id !== option.id));
      if (option.hasDropdown) {
        onDropdownSelectionsChange?.([]);
        setOpenDropdownId(null);
      }
      return;
    }

    onChange([...value, option.id as T]);
    if (!useTileDropdown && option.hasDropdown && option.dropdownOptions?.length) {
      setOpenDropdownId(option.id);
    } else {
      setOpenDropdownId(null);
    }
  };

  const handleDropdownToggle = (optionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenDropdownId((current) => (current === optionId ? null : optionId));
  };

  useEffect(() => {
    if (useTileDropdown || !openDropdownId) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (fieldsetRef.current?.contains(target)) {
        return;
      }

      setOpenDropdownId(null);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openDropdownId, useTileDropdown]);

  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 xl:grid-cols-5",
  }[columns];

  const useEqualTileHeight = columns === 5;
  const hasError = Boolean(error);

  const renderDropdownTile = (
    dropdownOption: IconTileDropdownOption,
    parentOption: IconTileOption,
  ) => {
    const SubIcon = dropdownOption.icon;
    const isChecked = dropdownSelections.includes(dropdownOption.id);

    return (
      <button
        key={`${parentOption.id}-${dropdownOption.id}`}
        type="button"
        role="checkbox"
        aria-checked={isChecked}
        onClick={() => toggleDropdownSelection(dropdownOption.id)}
        className={`relative flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border px-3 py-3.5 text-center text-xs font-medium transition-all sm:px-4 sm:py-4 sm:text-sm${
          useEqualTileHeight ? " h-full min-h-[5.75rem] sm:min-h-[6.25rem]" : ""
        } ${
          isChecked
            ? "border-sky-500 bg-sky-50 text-sky-800 shadow-sm ring-1 ring-sky-500/30"
            : hasError
              ? "border-red-300 bg-white text-slate-600 hover:border-red-400 hover:bg-red-50/40"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
        }`}
      >
        {SubIcon ? (
          <SubIcon
            className={`h-6 w-6 sm:h-7 sm:w-7 ${isChecked ? "text-sky-600" : "text-slate-400"}`}
            aria-hidden
          />
        ) : null}
        <span
          className={`flex items-center justify-center gap-1 leading-tight${
            useEqualTileHeight ? " min-h-[2.5rem] text-center sm:min-h-[2.75rem]" : ""
          }`}
        >
          {dropdownOption.label}
        </span>
      </button>
    );
  };

  return (
    <fieldset ref={fieldsetRef} aria-invalid={hasError}>
      <legend className="mb-3 text-sm font-semibold text-slate-700">{legend}</legend>
      <div className={`grid gap-2.5 ${gridCols}`} role="group" aria-label={legend}>
        {options.flatMap((option) => {
          const Icon = option.icon;
          const isSelected = value.includes(option.id as T);
          const isDropdownOpen = openDropdownId === option.id;
          const selectionCount = option.hasDropdown ? dropdownSelections.length : 0;
          const showExpandedTiles =
            useTileDropdown &&
            option.hasDropdown &&
            isSelected &&
            Boolean(option.dropdownOptions?.length);

          const mainTile = (
            <div key={option.id} className={`relative${useEqualTileHeight ? " h-full" : ""}`}>
              <button
                type="button"
                name={name}
                role="checkbox"
                aria-checked={isSelected}
                aria-expanded={option.hasDropdown ? isDropdownOpen : undefined}
                onClick={() => handleTileClick(option)}
                className={`relative flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border px-3 py-3.5 text-center text-xs font-medium transition-all sm:px-4 sm:py-4 sm:text-sm${
                  useEqualTileHeight ? " h-full min-h-[5.75rem] sm:min-h-[6.25rem]" : ""
                } ${
                  isSelected
                    ? "border-sky-500 bg-sky-50 text-sky-800 shadow-sm ring-1 ring-sky-500/30"
                    : hasError
                      ? "border-red-300 bg-white text-slate-600 hover:border-red-400 hover:bg-red-50/40"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <Icon
                  className={`h-6 w-6 sm:h-7 sm:w-7 ${isSelected ? "text-sky-600" : "text-slate-400"}`}
                  aria-hidden
                />
                <span
                  className={`flex items-center justify-center gap-1 leading-tight${
                    useEqualTileHeight ? " min-h-[2.5rem] text-center sm:min-h-[2.75rem]" : ""
                  }`}
                >
                  {option.label}
                  {!useTileDropdown && option.hasDropdown && isSelected && (
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={`Toggle ${option.label} options`}
                      aria-expanded={isDropdownOpen}
                      onClick={(event) => handleDropdownToggle(option.id, event)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleDropdownToggle(option.id, event as unknown as React.MouseEvent);
                        }
                      }}
                      className="inline-flex rounded p-0.5 hover:bg-sky-100"
                    >
                      <ChevronDown
                        className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${
                          isDropdownOpen ? "rotate-180" : ""
                        }`}
                        aria-hidden
                      />
                    </span>
                  )}
                </span>
                {option.hasDropdown && !useTileDropdown && selectionCount > 0 && (
                  <span className="absolute -right-1 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-600 px-1 text-[10px] font-semibold leading-none text-white">
                    {selectionCount}
                  </span>
                )}
              </button>

              {!useTileDropdown &&
              option.hasDropdown &&
              isDropdownOpen &&
              option.dropdownOptions?.length ? (
                <div className="absolute left-0 top-full z-10 mt-1 min-w-[12rem] rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg shadow-slate-900/10 sm:left-auto sm:right-0">
                  {option.dropdownOptions.map((dropdownOption) => {
                    const isChecked = dropdownSelections.includes(dropdownOption.id);

                    return (
                      <label
                        key={dropdownOption.id}
                        className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm text-slate-800 transition-colors hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleDropdownSelection(dropdownOption.id)}
                          className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                        {dropdownOption.label}
                      </label>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );

          if (!showExpandedTiles) {
            return [mainTile];
          }

          return [
            ...option.dropdownOptions!.map((dropdownOption) =>
              renderDropdownTile(dropdownOption, option),
            ),
            mainTile,
          ];
        })}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
