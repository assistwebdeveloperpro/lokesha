"use client";

import { Building2 } from "lucide-react";
import { useState } from "react";
import { getAssetUrl } from "@/services/apiClient";

export default function PropertyThumbnail({ imageUrl }: { imageUrl: string | null }) {
  const [hasError, setHasError] = useState(false);

  return (
    <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br from-indigo-50 to-sky-100 text-indigo-600 ring-1 ring-indigo-100">
      {imageUrl && !hasError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={getAssetUrl(imageUrl)}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <Building2 className="h-6 w-6" aria-hidden />
      )}
    </span>
  );
}
