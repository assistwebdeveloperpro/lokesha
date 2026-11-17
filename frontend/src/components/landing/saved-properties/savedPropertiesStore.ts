"use client";

import { useEffect, useSyncExternalStore } from "react";
import { fetchSavedPropertyIds } from "@/services/savedProperties.service";
import { getToken, SESSION_CHANGE_EVENT } from "@/services/session";

type Listener = () => void;

const EMPTY_IDS: ReadonlySet<string> = new Set();

const listeners = new Set<Listener>();
let savedIds: ReadonlySet<string> = EMPTY_IDS;
let loadedToken: string | null = null;
let pendingToken: string | null = null;
let isSessionListenerBound = false;

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => savedIds;
const getServerSnapshot = () => EMPTY_IDS;

export function markSaved(propertyId: string) {
  if (savedIds.has(propertyId)) return;
  savedIds = new Set(savedIds).add(propertyId);
  emit();
}

export function markUnsaved(propertyId: string) {
  if (!savedIds.has(propertyId)) return;
  const next = new Set(savedIds);
  next.delete(propertyId);
  savedIds = next;
  emit();
}

async function loadSavedIds() {
  const token = getToken();
  if (!token) {
    if (loadedToken !== null || savedIds.size > 0) {
      savedIds = EMPTY_IDS;
      loadedToken = null;
      emit();
    }
    return;
  }
  if (token === loadedToken || token === pendingToken) return;

  pendingToken = token;
  try {
    const { propertyIds } = await fetchSavedPropertyIds(token);
    // Ignore a stale response when the session changed while loading
    if (getToken() !== token) return;
    savedIds = new Set([...savedIds, ...propertyIds]);
    loadedToken = token;
    emit();
  } catch {
    // Hearts stay unfilled; the save endpoint is idempotent per property
  } finally {
    pendingToken = null;
  }
}

function bindSessionListener() {
  if (isSessionListenerBound || typeof window === "undefined") return;
  isSessionListenerBound = true;
  window.addEventListener(SESSION_CHANGE_EVENT, () => {
    // Drop the previous account's hearts before loading the new session's
    savedIds = EMPTY_IDS;
    loadedToken = null;
    emit();
    void loadSavedIds();
  });
}

function useSavedIds() {
  const ids = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    bindSessionListener();
    void loadSavedIds();
  }, []);

  return ids;
}

export function useIsPropertySaved(propertyId: string) {
  return useSavedIds().has(propertyId);
}

export function useSavedPropertiesCount() {
  return useSavedIds().size;
}
