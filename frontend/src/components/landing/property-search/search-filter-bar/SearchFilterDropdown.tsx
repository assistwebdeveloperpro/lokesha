"use client";

import { Check, ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { FOCUS_RING } from "../../home/hero-banner/heroBanner.shared";

type FilterDropdownContextValue = {
  openId: string | null;
  setOpenId: (id: string | null) => void;
  closeAll: () => void;
};

const FilterDropdownContext = createContext<FilterDropdownContextValue | null>(
  null,
);

export function SearchFilterBarProvider({ children }: { children: ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const closeAll = useCallback(() => setOpenId(null), []);
  return (
    <FilterDropdownContext.Provider value={{ openId, setOpenId, closeAll }}>
      {children}
    </FilterDropdownContext.Provider>
  );
}

export function useCloseSearchFilterBar() {
  const ctx = useContext(FilterDropdownContext);
  return ctx?.closeAll ?? (() => undefined);
}

function useFilterDropdown(id: string) {
  const ctx = useContext(FilterDropdownContext);
  if (!ctx) throw new Error("SearchFilterBarProvider is required");
  const isOpen = ctx.openId === id;
  const setOpen = useCallback(
    (next: boolean) => ctx.setOpenId(next ? id : null),
    [ctx, id],
  );
  return { isOpen, setOpen, close: () => ctx.setOpenId(null) };
}

export function SearchFilterBarChip({
  label,
  onClear,
}: {
  label: string;
  onClear: () => void;
}) {
  return (
    <span className="inline-flex max-w-[11rem] shrink-0 items-center gap-1 rounded-md border border-navy-blue/20 bg-sky-50 py-1 pl-3 pr-1 text-sm font-semibold text-navy-blue">
      <span className="truncate">{label}</span>
      <button
        type="button"
        aria-label={`Remove ${label}`}
        onClick={onClear}
        className={`flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full bg-navy-blue text-white hover:bg-navy-blue/90 ${FOCUS_RING}`}
      >
        <X className="h-3 w-3" aria-hidden />
      </button>
    </span>
  );
}

type FilterDropdownProps = {
  id: string;
  label: string;
  active?: boolean;
  panelClassName?: string;
  panelMaxWidth?: number;
  leadingBadge?: number;
  onOpen?: () => void;
  onClear?: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function SearchFilterDropdown({
  id,
  label,
  active = false,
  panelClassName = "",
  panelMaxWidth = 448,
  leadingBadge,
  onOpen,
  onClear,
  children,
  footer,
}: FilterDropdownProps) {
  const { isOpen, setOpen } = useFilterDropdown(id);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});

  const updatePanelPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const maxWidth = Math.min(window.innerWidth - 16, panelMaxWidth);
    const left = Math.min(rect.left, window.innerWidth - maxWidth - 8);
    setPanelStyle({
      position: "fixed",
      top: rect.bottom + 8,
      left: Math.max(8, left),
      width: maxWidth,
      zIndex: 60,
    });
  }, [panelMaxWidth]);

  useEffect(() => {
    if (!isOpen) return;
    updatePanelPosition();
    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);
    return () => {
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
    };
  }, [isOpen, updatePanelPosition]);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handlePointer);
    return () => document.removeEventListener("mousedown", handlePointer);
  }, [isOpen, setOpen]);

  const panel = isOpen ? (
    <div
      ref={panelRef}
      role="dialog"
      style={panelStyle}
      className={`rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-xl ${panelClassName}`}
    >
      {children}
      {footer}
    </div>
  ) : null;

  return (
    <>
      <div className="relative shrink-0">
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={isOpen}
          onClick={() => {
            if (!isOpen) onOpen?.();
            setOpen(!isOpen);
          }}
          className={`inline-flex h-9 max-w-[14rem] cursor-pointer items-center gap-1.5 rounded-md border border-slate-300 px-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 ${FOCUS_RING} ${
            isOpen || active
              ? "bg-slate-100"
              : "bg-white hover:bg-slate-50"
          }`}
        >
          {leadingBadge !== undefined ? (
            <span className="inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-amber-400 px-1.5 text-xs font-bold text-slate-900">
              {leadingBadge}
            </span>
          ) : null}
          <span className="truncate">{label}</span>
          {onClear ? (
            <span
              role="button"
              tabIndex={0}
              aria-label={`Clear ${label}`}
              onClick={(event) => {
                event.stopPropagation();
                onClear();
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  onClear();
                }
              }}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy-blue text-white hover:bg-navy-blue/90 ${FOCUS_RING}`}
            >
              <X className="h-3 w-3" aria-hidden />
            </span>
          ) : null}
          {active && !isOpen && !onClear ? (
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-navy-blue" aria-hidden />
          ) : null}
          {isOpen ? (
            <ChevronUp className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
          )}
        </button>
      </div>
      {typeof document !== "undefined" && panel
        ? createPortal(panel, document.body)
        : null}
    </>
  );
}

export function SearchFilterPanelTitle({ children }: { children: ReactNode }) {
  return (
    <p className="text-base font-bold text-slate-900">{children}</p>
  );
}

export function SearchFilterDoneButton({
  onClick,
  inline = false,
}: {
  onClick?: () => void;
  inline?: boolean;
}) {
  const closeAll = useCloseSearchFilterBar();
  return (
    <div
      className={
        inline ? "shrink-0" : "mt-2.5 flex justify-end border-t border-slate-100 pt-2"
      }
    >
      <button
        type="button"
        onClick={() => {
          onClick?.();
          closeAll();
        }}
        className={`cursor-pointer text-sm font-bold text-navy-blue hover:text-navy-blue/80 ${FOCUS_RING}`}
      >
        Done
      </button>
    </div>
  );
}

export function FilterToggleChip({
  label,
  selected,
  onToggle,
  tone = "default",
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
  tone?: "default" | "light";
}) {
  const unselectedClass =
    tone === "light"
      ? "border-slate-300 bg-transparent text-slate-800 font-medium hover:border-slate-400"
      : "border-slate-300 bg-white text-slate-700 font-semibold hover:border-sky-200 hover:bg-slate-50";
  const selectedClass =
    "border-navy-blue bg-navy-blue text-white font-semibold";

  const radiusClass = tone === "light" ? "rounded-md" : "rounded-full";
  const sizeClass =
    tone === "light" ? "px-3 py-1.5" : "px-2.5 py-1";

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={`inline-flex cursor-pointer items-center gap-1.5 border text-sm transition ${radiusClass} ${sizeClass} ${FOCUS_RING} ${
        selected ? selectedClass : unselectedClass
      }`}
    >
      {selected ? (
        <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
      ) : (
        <Plus className="h-3.5 w-3.5 shrink-0" aria-hidden />
      )}
      {label}
    </button>
  );
}
