"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/shared/ui/ToastProvider";
import {
  fetchLimelightEntries,
  removeLimelightProject,
  saveLimelightOrder,
  type LimelightEntry,
} from "@/services/adminLimelightProjects.service";
import { ApiError } from "@/services/apiClient";
import { moveItem } from "./limelightShared";
import { useAdminRequest } from "./useAdminRequest";

const LOAD_ERROR = "We could not load the Limelight projects. Please try again.";
const SAVE_ERROR = "We could not save the order. Please try again.";
const REMOVE_ERROR = "We could not remove the project. Please try again.";

const errorMessage = (failure: unknown, fallback: string) =>
  failure instanceof ApiError ? failure.message : fallback;

const toIds = (entries: LimelightEntry[]) => entries.map((entry) => entry.projectId);

export function useLimelightEntries(refreshKey: number, onRemoved: () => void) {
  const { showToast } = useToast();
  const runRequest = useAdminRequest();
  const [saved, setSaved] = useState<LimelightEntry[]>([]);
  const [entries, setEntries] = useState<LimelightEntry[]>([]);
  const [reloadToken, setReloadToken] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    runRequest((token) => fetchLimelightEntries(token))
      .then((response) => {
        if (cancelled || !response) return;
        setSaved(response.items);
        setEntries(response.items);
        setError("");
      })
      .catch(() => {
        if (!cancelled) setError(LOAD_ERROR);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken, refreshKey, runRequest]);

  const reload = useCallback(() => setReloadToken((current) => current + 1), []);

  const move = (from: number, to: number) => setEntries((current) => moveItem(current, from, to));

  const isOrderChanged = toIds(entries).join() !== toIds(saved).join();

  const saveOrder = async () => {
    if (isSaving || !isOrderChanged) return;

    setIsSaving(true);
    try {
      const done = await runRequest((token) => saveLimelightOrder(toIds(entries), token));
      if (done === undefined) return;

      setSaved(entries);
      showToast("Limelight order saved");
    } catch (failure: unknown) {
      showToast(errorMessage(failure, SAVE_ERROR), "error");
      if (failure instanceof ApiError && failure.status === 409) reload();
    } finally {
      setIsSaving(false);
    }
  };

  const removeProject = async (projectId: string) => {
    if (isRemoving) return false;

    setIsRemoving(true);
    try {
      const done = await runRequest((token) => removeLimelightProject(projectId, token));
      if (done === undefined) return false;

      const withoutProject = (items: LimelightEntry[]) => items.filter((item) => item.projectId !== projectId);
      setSaved(withoutProject);
      setEntries(withoutProject);
      showToast("Project removed from Limelight");
      onRemoved();
      return true;
    } catch (failure: unknown) {
      showToast(errorMessage(failure, REMOVE_ERROR), "error");
      return false;
    } finally {
      setIsRemoving(false);
    }
  };

  return { entries, isLoading, error, isSaving, isRemoving, isOrderChanged, move, saveOrder, removeProject, reload };
}
