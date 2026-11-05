"use client";

import { Check, Copy } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const NOT_AVAILABLE = "Not Available";

type PropertyDetailsReraIdValueProps = {
  value: string;
  className?: string;
};

export function PropertyDetailsReraIdValue({ value, className }: PropertyDetailsReraIdValueProps) {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canCopy = value !== NOT_AVAILABLE && value.trim().length > 0;

  const handleCopy = useCallback(async () => {
    if (!canCopy) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  }, [canCopy, value]);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  return (
    <div className={cn("flex min-w-0 items-center gap-1.5", className)}>
      <span className="min-w-0 flex-1 truncate" title={value}>
        {value}
      </span>
      {canCopy ? (
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-sky-200 hover:bg-sky-50/80 hover:text-sky-700"
          aria-label={copied ? "Rera ID copied" : "Copy Rera ID"}
        >
          {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
        </button>
      ) : null}
    </div>
  );
}
