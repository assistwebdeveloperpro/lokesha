"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createDraft,
  saveDraft,
  type PropertyScope,
  type SaveDraftInput,
} from "@/services/property.service";
import {
  createDraftSaveQueue,
  type DraftSaveQueue,
  type DraftSaveStatus,
} from "../utils/draftSaveQueue";

type UsePostPropertyDraftOptions = {
  token: string | null;
  scope: PropertyScope;
  // Off while editing a posted property, which has no draft
  enabled: boolean;
  getInput: () => SaveDraftInput;
  onCreated: (draftId: string) => void;
};

// Keeps the form in a server draft; the draft is created on the first save
export function usePostPropertyDraft({
  token,
  scope,
  enabled,
  getInput,
  onCreated,
}: UsePostPropertyDraftOptions) {
  const [draftId, setDraftId] = useState<string | null>(null);
  const [status, setStatus] = useState<DraftSaveStatus>("idle");

  const latest = useRef({ token, scope, getInput, onCreated });
  useEffect(() => {
    latest.current = { token, scope, getInput, onCreated };
  });

  // Created on first use, from an event handler or effect, never while rendering
  const queueRef = useRef<DraftSaveQueue | null>(null);
  const getQueue = useCallback(() => {
    queueRef.current ??= createDraftSaveQueue(
      {
        create: async (input) => {
          const { draft } = await createDraft(input, latest.current.token ?? "", latest.current.scope);
          return draft.id;
        },
        update: async (id, input) => {
          await saveDraft(id, input, latest.current.token ?? "", latest.current.scope);
        },
      },
      {
        onCreated: (id) => {
          setDraftId(id);
          latest.current.onCreated(id);
        },
        onStatusChange: setStatus,
      },
    );
    return queueRef.current;
  }, []);

  const canSave = enabled && Boolean(token);

  const save = useCallback(
    async (currentStep?: number) => {
      if (!canSave) {
        return false;
      }

      const input = latest.current.getInput();
      return getQueue().save(currentStep ? { ...input, currentStep } : input);
    },
    [canSave, getQueue],
  );

  const flush = useCallback(() => getQueue().flush(), [getQueue]);

  const ensureDraftId = useCallback(
    async () => (canSave ? getQueue().ensureId(() => latest.current.getInput()) : null),
    [canSave, getQueue],
  );

  // A draft that was loaded from the server, or null once it has been completed
  const adopt = useCallback(
    (id: string | null) => {
      getQueue().adopt(id);
      setDraftId(id);
      setStatus("idle");
    },
    [getQueue],
  );

  return { draftId, status, save, flush, ensureDraftId, adopt };
}
