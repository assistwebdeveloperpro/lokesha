"use client";

import { Heart } from "lucide-react";
import type { SavedProperty } from "@/services/savedProperties.service";
import PropertyActivityCard, { CARD_ICON_BUTTON_CLASS_NAME } from "./PropertyActivityCard";
import { isNewSave } from "./savedPropertiesShared";

type SavedPropertyCardProps = {
  item: SavedProperty;
  onRemove: (item: SavedProperty) => void;
  selection?: { checked: boolean; onToggle: () => void };
};

export default function SavedPropertyCard({ item, onRemove, selection }: SavedPropertyCardProps) {
  return (
    <PropertyActivityCard
      item={item}
      isNew={isNewSave(item.savedAt)}
      selection={selection}
      action={
        <button
          type="button"
          aria-label="Remove from Shortlisted properties"
          onClick={() => onRemove(item)}
          className={`${CARD_ICON_BUTTON_CLASS_NAME} border-rose-200 bg-rose-50/80 text-rose-600 hover:bg-rose-100`}
        >
          <Heart className="h-4 w-4 fill-current" aria-hidden />
        </button>
      }
    />
  );
}
