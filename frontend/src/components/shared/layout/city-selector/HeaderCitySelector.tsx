"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import CitySelectorDropdown from "./CitySelectorDropdown";
import {
  ALL_INDIA_LABEL,
  DEFAULT_SELECTED_CITY,
  readStoredCity,
  storeCity,
} from "./citySelector.shared";

type HeaderCitySelectorProps = {
  variant?: "desktop" | "mobile";
};

export default function HeaderCitySelector({ variant = "desktop" }: HeaderCitySelectorProps) {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_SELECTED_CITY);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSelectedCity(readStoredCity());
  }, []);

  const persistCity = useCallback((city: string) => {
    setSelectedCity(city);
    storeCity(city);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  const isInsideSelector = useCallback((target: EventTarget | null) => {
    if (!(target instanceof Node)) return false;
    return Boolean(rootRef.current?.contains(target) || panelRef.current?.contains(target));
  }, []);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => setOpen(false), 120);
  }, [clearCloseTimer]);

  const handleOpen = useCallback(() => {
    clearCloseTimer();
    setOpen(true);
  }, [clearCloseTimer]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!isInsideSelector(event.target)) close();
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, close, isInsideSelector]);

  useEffect(() => clearCloseTimer, [clearCloseTimer]);

  const triggerLabel = selectedCity || ALL_INDIA_LABEL;
  const isDesktop = variant === "desktop";
  const ChevronIcon = open ? ChevronUp : ChevronDown;

  return (
    <div
      ref={rootRef}
      className="relative min-w-0"
      onMouseEnter={isDesktop ? handleOpen : undefined}
      onMouseLeave={
        isDesktop
          ? (event) => {
              if (isInsideSelector(event.relatedTarget)) return;
              scheduleClose();
            }
          : undefined
      }
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex max-w-full min-w-0 cursor-pointer items-center gap-0.5 rounded-md px-1 py-1 text-sm font-light text-white sm:gap-1 sm:text-base"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span className="truncate">{triggerLabel}</span>
        <ChevronIcon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
      </button>

      {open && (
        <CitySelectorDropdown
          variant={variant}
          selectedCity={selectedCity}
          onSelectCity={persistCity}
          onClose={close}
          triggerRef={triggerRef}
          panelRef={panelRef}
          onMouseEnter={isDesktop ? handleOpen : undefined}
          onMouseLeave={
            isDesktop
              ? (event) => {
                  if (isInsideSelector(event.relatedTarget)) return;
                  scheduleClose();
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
