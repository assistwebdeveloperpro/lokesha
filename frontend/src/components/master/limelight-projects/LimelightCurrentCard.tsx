"use client";

import { ArrowLeft, ArrowRight, MapPin, Trash2 } from "lucide-react";
import type { LimelightEntry } from "@/services/adminLimelightProjects.service";
import LimelightProjectThumb from "./LimelightProjectThumb";
import { formatProjectLocation, formatProjectPrice } from "./limelightShared";

type LimelightCurrentCardProps = {
  entry: LimelightEntry;
  position: number;
  isFirst: boolean;
  isLast: boolean;
  onMove: (offset: -1 | 1) => void;
  onRemove: (entry: LimelightEntry) => void;
};

const iconButtonClassName =
  "inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40";

export default function LimelightCurrentCard({
  entry,
  position,
  isFirst,
  isLast,
  onMove,
  onRemove,
}: LimelightCurrentCardProps) {
  return (
    <li className="group flex flex-col overflow-hidden rounded-2xl border-2 border-orange-100 bg-white shadow-sm transition duration-200 hover:shadow-lg">
      <div className="relative">
        <LimelightProjectThumb src={entry.mainImage} alt={entry.projectName} className="aspect-16/10 w-full" />
        <span className="absolute left-3 top-3 inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-navy-blue px-2 text-xs font-bold text-white shadow-sm">
          {position}
        </span>
        {!entry.isVisible ? (
          <span className="absolute right-3 top-3 rounded-full bg-red-600 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
            Not Visible - Inactive
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="font-display truncate text-base font-bold text-slate-900">{entry.projectName}</h3>
        <p className="truncate text-sm text-slate-600">{entry.builderName ?? "Builder not available"}</p>
        <p className="flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin className="h-4 w-4 shrink-0 text-red-500" aria-hidden />
          <span className="truncate">{formatProjectLocation(entry)}</span>
        </p>
        <p className="pt-1 text-sm font-semibold text-slate-900">{formatProjectPrice(entry)}</p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label={`Move ${entry.projectName} earlier`}
              disabled={isFirst}
              onClick={() => onMove(-1)}
              className={iconButtonClassName}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              aria-label={`Move ${entry.projectName} later`}
              disabled={isLast}
              onClick={() => onMove(1)}
              className={iconButtonClassName}
            >
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <button
            type="button"
            onClick={() => onRemove(entry)}
            className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-red-200 px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
