"use client";

import { Loader2 } from "lucide-react";
import type { PublicSearchPostedBy } from "@/components/landing/property-search/property-list/publicSearchListing.types";
import { propertyDetailsContactLabel } from "@/components/landing/property-details/propertyDetailsContactLabel";
import { ConnectSellerModal } from "./ConnectSellerModal";
import { PropertyContactSuccessModal } from "./PropertyContactSuccessModal";
import { propertyContactDisplayName } from "./propertyContactDisplayName";
import { usePropertyContact } from "./usePropertyContact";

type PropertyContactButtonProps = {
  propertyId: string;
  postedBy: PublicSearchPostedBy;
  className: string;
};

export function PropertyContactButton({ propertyId, postedBy, className }: PropertyContactButtonProps) {
  const { contact, isLoading, isSent, result, reset, isConnectModalOpen, closeConnectModal, handleVerified } =
    usePropertyContact(propertyId, postedBy);

  return (
    <>
      <button
        type="button"
        onClick={contact}
        disabled={isLoading || isSent}
        aria-busy={isLoading}
        className={`${className} inline-flex items-center justify-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-70`}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        {isLoading ? "Loading..." : isSent ? "Inquiry Sent" : propertyDetailsContactLabel(postedBy)}
      </button>
      {isConnectModalOpen ? <ConnectSellerModal onClose={closeConnectModal} onVerified={handleVerified} /> : null}
      {result ? (
        <PropertyContactSuccessModal
          postedBy={postedBy}
          contactName={propertyContactDisplayName(postedBy, result.contactName)}
          contactPhone={result.contactPhone}
          creditBalance={result.creditBalance}
          canSubscribe={result.canSubscribe}
          onClose={reset}
        />
      ) : null}
    </>
  );
}
