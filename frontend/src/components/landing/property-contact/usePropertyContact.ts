"use client";

import { useCallback, useState } from "react";
import type { PublicSearchPostedBy } from "@/components/landing/property-search/property-list/publicSearchListing.types";
import { useToast } from "@/components/shared/ui/ToastProvider";
import { ApiError } from "@/services/apiClient";
import {
  contactPropertyLister,
  type PropertyContactResult,
  type PropertyContactRole,
} from "@/services/propertyContact.service";
import { clearSession, getToken } from "@/services/session";
import { markPropertyContacted, useIsPropertyContacted } from "./contactedPropertiesStore";

const CONTACT_SUCCESS_MESSAGE = "Your inquiry has been sent.";
const CONTACT_FAILED_MESSAGE = "Unable to send your inquiry. Please try again.";

const CONTACT_ROLE: Record<PublicSearchPostedBy, PropertyContactRole> = {
  owner: "owner",
  dealer: "agent",
  builder: "builder",
};

export function usePropertyContact(propertyId: string, postedBy: PublicSearchPostedBy) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PropertyContactResult | null>(null);
  const isSent = useIsPropertyContacted(propertyId);

  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  const openConnectModal = useCallback(() => setIsConnectModalOpen(true), []);

  const closeConnectModal = useCallback(() => setIsConnectModalOpen(false), []);

  const sendInquiry = useCallback(
    async (token: string) => {
      setIsLoading(true);
      try {
        const response = await contactPropertyLister({ propertyId, contactRole: CONTACT_ROLE[postedBy] }, token);
        setResult(response);
        markPropertyContacted(propertyId);
        showToast(CONTACT_SUCCESS_MESSAGE);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          clearSession();
          openConnectModal();
          return;
        }
        const message = error instanceof ApiError ? (error.errors?.[0] ?? error.message) : CONTACT_FAILED_MESSAGE;
        showToast(message, "error");
      } finally {
        setIsLoading(false);
      }
    },
    [openConnectModal, postedBy, propertyId, showToast],
  );

  const contact = useCallback(async () => {
    if (isLoading || isSent) return;

    const token = getToken();
    if (!token) {
      openConnectModal();
      return;
    }

    await sendInquiry(token);
  }, [isLoading, isSent, openConnectModal, sendInquiry]);

  const handleVerified = useCallback(
    (token: string) => {
      setIsConnectModalOpen(false);
      void sendInquiry(token);
    },
    [sendInquiry],
  );

  const reset = useCallback(() => setResult(null), []);

  return {
    contact,
    isLoading,
    isSent,
    result,
    reset,
    isConnectModalOpen,
    closeConnectModal,
    handleVerified,
  };
}
