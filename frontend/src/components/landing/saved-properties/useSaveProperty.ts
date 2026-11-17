"use client";

import { useCallback, useState } from "react";
import { useToast } from "@/components/shared/ui/ToastProvider";
import { ApiError } from "@/services/apiClient";
import { savePropertyRequest, unsavePropertyRequest } from "@/services/savedProperties.service";
import { clearSession, getToken } from "@/services/session";
import { SAVE_PROPERTY_MESSAGES } from "./savePropertyModal.copy";
import { markSaved, markUnsaved, useIsPropertySaved } from "./savedPropertiesStore";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) return error.errors?.[0] ?? error.message;
  return fallback;
}

export function useSaveProperty(propertyId: string) {
  const { showToast } = useToast();
  const isSaved = useIsPropertySaved(propertyId);
  const [isPending, setIsPending] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);

  const save = useCallback(
    async (token: string) => {
      setIsPending(true);
      markSaved(propertyId);
      try {
        await savePropertyRequest(propertyId, token);
        showToast(SAVE_PROPERTY_MESSAGES.saved);
      } catch (error) {
        markUnsaved(propertyId);
        if (error instanceof ApiError && error.status === 401) {
          clearSession();
          openLoginModal();
          return;
        }
        showToast(getErrorMessage(error, SAVE_PROPERTY_MESSAGES.saveFailed), "error");
      } finally {
        setIsPending(false);
      }
    },
    [openLoginModal, propertyId, showToast],
  );

  const unsave = useCallback(
    async (token: string) => {
      setIsPending(true);
      markUnsaved(propertyId);
      try {
        await unsavePropertyRequest(propertyId, token);
        showToast(SAVE_PROPERTY_MESSAGES.unsaved);
      } catch (error) {
        markSaved(propertyId);
        if (error instanceof ApiError && error.status === 401) {
          clearSession();
          openLoginModal();
          return;
        }
        showToast(getErrorMessage(error, SAVE_PROPERTY_MESSAGES.unsaveFailed), "error");
      } finally {
        setIsPending(false);
      }
    },
    [openLoginModal, propertyId, showToast],
  );

  const toggle = useCallback(async () => {
    if (isPending) return;

    const token = getToken();
    if (!token) {
      openLoginModal();
      return;
    }

    await (isSaved ? unsave(token) : save(token));
  }, [isPending, isSaved, openLoginModal, save, unsave]);

  const handleAuthenticated = useCallback(
    (token: string) => {
      setIsLoginModalOpen(false);
      void save(token);
    },
    [save],
  );

  return {
    isSaved,
    isPending,
    toggle,
    isLoginModalOpen,
    closeLoginModal,
    handleAuthenticated,
  };
}
