"use client";

import { Heart, Loader2 } from "lucide-react";
import { SavePropertyLoginModal } from "./SavePropertyLoginModal";
import { useSaveProperty } from "./useSaveProperty";

type SavePropertyButtonProps = {
  propertyId: string;
  className?: string;
  size?: "md" | "sm";
};

const BASE_CLASS_NAME =
  "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-xl border bg-white shadow-sm transition disabled:cursor-not-allowed";
const SIZE_CLASS_NAMES = { md: "h-10 w-10", sm: "h-9 w-9" };
const SAVED_CLASS_NAME = "border-rose-200 bg-rose-50/80 text-rose-600";
const DEFAULT_CLASS_NAME =
  "border-slate-200 text-slate-500 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700";

export function SavePropertyButton({ propertyId, className = "", size = "md" }: SavePropertyButtonProps) {
  const { isSaved, isPending, toggle, isLoginModalOpen, closeLoginModal, handleAuthenticated } =
    useSaveProperty(propertyId);

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        aria-pressed={isSaved}
        aria-busy={isPending}
        aria-label={isSaved ? "Remove from saved properties" : "Save property"}
        className={`${BASE_CLASS_NAME} ${SIZE_CLASS_NAMES[size]} ${isSaved ? SAVED_CLASS_NAME : DEFAULT_CLASS_NAME} ${className}`}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} aria-hidden />
        )}
      </button>
      {isLoginModalOpen ? (
        <SavePropertyLoginModal onClose={closeLoginModal} onAuthenticated={handleAuthenticated} />
      ) : null}
    </>
  );
}
