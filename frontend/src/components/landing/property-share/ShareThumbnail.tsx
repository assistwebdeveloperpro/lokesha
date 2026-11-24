"use client";

import { Building2 } from "lucide-react";
import { useState } from "react";
import { getAssetUrl } from "@/services/apiClient";

type ShareThumbnailProps = {
  imageUrl: string | null;
  alt: string;
  className?: string;
};

export function ShareThumbnail({ imageUrl, alt, className = "h-16 w-16" }: ShareThumbnailProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-linear-to-br from-indigo-50 to-sky-100 text-indigo-600 ${className}`}
    >
      {imageUrl && !hasError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={getAssetUrl(imageUrl)}
          alt={alt}
          loading="lazy"
          draggable={false}
          className="h-full w-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <Building2 className="h-6 w-6" aria-hidden />
      )}
    </span>
  );
}
