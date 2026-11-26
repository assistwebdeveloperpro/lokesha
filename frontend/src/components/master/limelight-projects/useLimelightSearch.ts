"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/shared/ui/ToastProvider";
import {
  addLimelightProjects,
  searchLimelightProjects,
  type LimelightSearchResult,
} from "@/services/adminLimelightProjects.service";
import { ApiError } from "@/services/apiClient";
import { DEFAULT_LIMELIGHT_FILTERS, pluralizeProjects, toSearchQuery, type LimelightFilters } from "./limelightShared";
import { useAdminRequest } from "./useAdminRequest";

const LOAD_ERROR = "We could not load the projects. Please try again.";
const ADD_ERROR = "We could not add the projects. Please try again.";

type SearchState = { items: LimelightSearchResult[]; total: number };

const errorMessage = (failure: unknown, fallback: string) =>
  failure instanceof ApiError ? failure.message : fallback;

export function useLimelightSearch(refreshKey: number, onAdded: () => void) {
  const { showToast } = useToast();
  const runRequest = useAdminRequest();
  const [draft, setDraft] = useState<LimelightFilters>(DEFAULT_LIMELIGHT_FILTERS);
  const [applied, setApplied] = useState<LimelightFilters>(DEFAULT_LIMELIGHT_FILTERS);
  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState<SearchState>({ items: [], total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  // Selections live outside the page so they survive paging and filter changes
  const [selected, setSelected] = useState<Map<string, LimelightSearchResult>>(new Map());
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    let cancelled = false;

    runRequest((token) => searchLimelightProjects(toSearchQuery(applied, page), token))
      .then((response) => {
        if (cancelled || !response) return;
        setResult({ items: response.items, total: response.total });
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
  }, [applied, page, reloadToken, refreshKey, runRequest]);

  const reload = useCallback(() => {
    setIsLoading(true);
    setReloadToken((current) => current + 1);
  }, []);

  const search = () => {
    setIsLoading(true);
    setPage(1);
    setApplied(draft);
  };

  const reset = () => {
    setIsLoading(true);
    setPage(1);
    setDraft(DEFAULT_LIMELIGHT_FILTERS);
    setApplied(DEFAULT_LIMELIGHT_FILTERS);
  };

  const changePage = (next: number) => {
    setIsLoading(true);
    setPage(next);
  };

  const toggleSelected = (project: LimelightSearchResult) => {
    setSelected((current) => {
      const next = new Map(current);
      if (next.has(project.projectId)) next.delete(project.projectId);
      else next.set(project.projectId, project);
      return next;
    });
  };

  const clearSelection = () => setSelected(new Map());

  const addSelected = async () => {
    if (isAdding || selected.size === 0) return false;

    setIsAdding(true);
    try {
      const added = await runRequest((token) => addLimelightProjects([...selected.keys()], token));
      if (!added) return false;

      showToast(`${pluralizeProjects(added.added)} added to Limelight`);
      clearSelection();
      reload();
      onAdded();
      return true;
    } catch (failure: unknown) {
      showToast(errorMessage(failure, ADD_ERROR), "error");
      return false;
    } finally {
      setIsAdding(false);
    }
  };

  return {
    draft,
    setDraft,
    applied,
    page,
    items: result.items,
    total: result.total,
    isLoading,
    error,
    selected,
    isAdding,
    search,
    reset,
    changePage,
    reload,
    toggleSelected,
    clearSelection,
    addSelected,
  };
}
