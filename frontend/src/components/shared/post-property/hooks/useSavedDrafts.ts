"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/shared/ui/ToastProvider";
import { deleteDraft, listDrafts, type DraftSummary } from "@/services/property.service";
import { getToken } from "@/services/session";

const DELETE_ERROR = "We could not delete the draft. Please try again.";

// The user's unfinished drafts; a failed load simply shows none
export function useSavedDrafts(enabled: boolean) {
  const { showToast } = useToast();
  const [drafts, setDrafts] = useState<DraftSummary[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!enabled || !token) return;

    let cancelled = false;
    listDrafts(token)
      .then((response) => !cancelled && setDrafts(response.drafts))
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  // Resolves true once the draft is gone
  const remove = useCallback(
    async (id: string) => {
      const token = getToken();
      if (!token) return false;

      setDeletingId(id);
      try {
        await deleteDraft(id, token);
        setDrafts((current) => current.filter((draft) => draft.id !== id));
        return true;
      } catch {
        showToast(DELETE_ERROR, "error");
        return false;
      } finally {
        setDeletingId(null);
      }
    },
    [showToast],
  );

  return { drafts: enabled ? drafts : [], deletingId, remove };
}
