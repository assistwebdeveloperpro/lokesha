"use client";

import { Link2 } from "lucide-react";
import { buildShortUrl, type ShareProperty } from "@/lib/property-share/propertyShare";
import { ShareChannelButtons } from "./ShareChannelButtons";
import { ShareModalShell } from "./ShareModalShell";
import { ShareThumbnail } from "./ShareThumbnail";
import { useShareActions } from "./useShareActions";

export type ShareListItem = ShareProperty & {
  id: string;
  imageUrl: string | null;
};

type SharePropertiesModalProps = {
  properties: ShareListItem[];
  onClose: () => void;
};

export function SharePropertiesModal({ properties, onClose }: SharePropertiesModalProps) {
  const { share, copyAllLinks } = useShareActions(properties);

  return (
    <ShareModalShell title={`Share ${properties.length} properties`} onClose={onClose} size="lg">
      <div className="space-y-5">
        <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
          {properties.map((property) => (
            <li
              key={property.id}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-2.5"
            >
              <ShareThumbnail imageUrl={property.imageUrl} alt={property.title} />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">{property.title}</p>
                <p className="truncate text-xs text-slate-600">{property.location}</p>
                <p className="truncate text-xs font-medium text-sky-700">{buildShortUrl(property.shortCode)}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="text-center text-sm font-medium text-slate-700">Share to your favorite platform!</p>
        <ShareChannelButtons onShare={share} />
        <p className="text-center text-xs text-slate-500">
          Facebook and Instagram copy all links so you can paste them into your post or message.
        </p>

        <button
          type="button"
          onClick={copyAllLinks}
          className="bg-linear-to-r-navy-blue flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white shadow-md transition hover:opacity-95"
        >
          <Link2 className="h-4 w-4" aria-hidden />
          Copy All Links
        </button>
      </div>
    </ShareModalShell>
  );
}
