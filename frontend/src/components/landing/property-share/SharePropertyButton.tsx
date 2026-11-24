"use client";

import { Share2 } from "lucide-react";
import { useCallback, useState } from "react";
import { SharePropertyModal } from "./SharePropertyModal";

type SharePropertyButtonProps = {
  propertyId: string;
  className: string;
  iconClassName?: string;
};

export function SharePropertyButton({
  propertyId,
  className,
  iconClassName = "h-4 w-4",
}: SharePropertyButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <>
      <button
        type="button"
        aria-label="Share property"
        aria-haspopup="dialog"
        onClick={() => setIsOpen(true)}
        className={className}
      >
        <Share2 className={iconClassName} aria-hidden />
      </button>
      {isOpen ? <SharePropertyModal propertyId={propertyId} onClose={close} /> : null}
    </>
  );
}
