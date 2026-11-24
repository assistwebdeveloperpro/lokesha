"use client";

import { MapPin } from "lucide-react";
import { useMemo } from "react";
import { buildShortUrl } from "@/lib/property-share/propertyShare";
import type { PropertyShare } from "@/services/propertyShare.service";
import { CopyLinkField } from "./CopyLinkField";
import { ShareChannelButtons } from "./ShareChannelButtons";
import { ShareModalShell } from "./ShareModalShell";
import { ShareThumbnail } from "./ShareThumbnail";
import { useSharePreview } from "./useSharePreview";
import { useShareActions } from "./useShareActions";

type SharePropertyModalProps = {
  propertyId: string;
  onClose: () => void;
};

function SharePropertyBody({ share }: { share: PropertyShare }) {
  const properties = useMemo(() => [share], [share]);
  const { share: shareVia, copyLink } = useShareActions(properties);

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
        <ShareThumbnail imageUrl={share.imageUrl} alt={share.title} className="h-20 w-20" />
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-bold text-slate-900">{share.title}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-600">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-sky-600" aria-hidden />
            <span className="truncate">{share.location}</span>
          </p>
          {share.description ? (
            <p className="mt-1 line-clamp-2 text-xs text-slate-500">{share.description}</p>
          ) : null}
        </div>
      </div>

      <p className="text-center text-sm font-medium text-slate-700">Share to your favorite platform!</p>
      <ShareChannelButtons onShare={shareVia} />
      <CopyLinkField url={buildShortUrl(share.shortCode)} onCopy={copyLink} />
    </div>
  );
}

function SharePropertySkeleton() {
  const bar = "animate-pulse rounded bg-slate-200/80";

  return (
    <div className="space-y-5" aria-busy aria-hidden>
      <div className="flex items-start gap-3 rounded-xl border border-slate-200 p-3">
        <span className="h-20 w-20 shrink-0 animate-pulse rounded-lg bg-slate-200/80" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className={`${bar} h-4 w-3/4`} />
          <div className={`${bar} h-3.5 w-1/2`} />
          <div className={`${bar} h-3 w-full`} />
        </div>
      </div>
      <div className={`${bar} mx-auto h-4 w-48`} />
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <span className="h-12 w-12 animate-pulse rounded-full bg-slate-200/80" />
            <div className={`${bar} h-3 w-14`} />
          </div>
        ))}
      </div>
      <div className="h-11 animate-pulse rounded-full bg-slate-200/80" />
    </div>
  );
}

export function SharePropertyModal({ propertyId, onClose }: SharePropertyModalProps) {
  const { share, error, isLoading, retry } = useSharePreview(propertyId);

  return (
    <ShareModalShell title="Share property" onClose={onClose}>
      {isLoading ? (
        <SharePropertySkeleton />
      ) : share ? (
        <SharePropertyBody share={share} />
      ) : (
        <div className="flex flex-col items-center py-6 text-center">
          <p className="text-sm font-medium text-red-600" role="alert">
            {error}
          </p>
          <button
            type="button"
            onClick={retry}
            className="bg-linear-to-r-navy-blue mt-4 min-h-10 cursor-pointer rounded-xl px-6 text-sm font-semibold text-white shadow-md"
          >
            Try again
          </button>
        </div>
      )}
    </ShareModalShell>
  );
}
