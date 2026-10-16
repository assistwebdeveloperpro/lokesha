import { Play } from "lucide-react";
import { getAssetUrl } from "@/services/apiClient";
import type { PropertyMedia } from "@/services/property.service";
import MediaRemoveButton from "./MediaRemoveButton";

export default function ExistingMediaThumbnail({
  media,
  index,
  onRemove,
}: {
  media: PropertyMedia;
  index: number;
  onRemove: () => void;
}) {
  const src = getAssetUrl(media.filePath);

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-slate-200 bg-white">
      {media.mediaType === "video" ? (
        <div className="relative flex h-full w-full items-center justify-center bg-slate-100">
          <video src={src} className="h-full w-full object-cover" muted playsInline />
          <span className="absolute inset-0 flex items-center justify-center bg-slate-900/20">
            <Play className="h-8 w-8 fill-white text-white" aria-hidden />
          </span>
        </div>
      ) : (
        <img src={src} alt={`Saved media ${index + 1}`} className="h-full w-full object-cover" />
      )}
      <MediaRemoveButton label={`Remove saved media ${index + 1}`} onRemove={onRemove} />
    </div>
  );
}
