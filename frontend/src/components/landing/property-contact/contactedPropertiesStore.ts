"use client";

import { useEffect, useSyncExternalStore } from "react";
import { fetchContactedPropertyIds } from "@/services/propertyContact.service";
import { getToken, SESSION_CHANGE_EVENT } from "@/services/session";

type Listener = () => void;

const listeners = new Set<Listener>();
let contactedIds: ReadonlySet<string> = new Set();
let loadedToken: string | null = null;
let pendingToken: string | null = null;

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => contactedIds;
const EMPTY_IDS: ReadonlySet<string> = new Set();
const getServerSnapshot = () => EMPTY_IDS;

export function markPropertyContacted(propertyId: string) {
  if (contactedIds.has(propertyId)) return;
  contactedIds = new Set(contactedIds).add(propertyId);
  emit();
}

function resetContactedIds() {
  if (contactedIds.size === 0) return;
  contactedIds = new Set();
  emit();
}

async function loadContactedIds() {
  const token = getToken();
  if (token !== loadedToken) resetContactedIds();

  if (!token) {
    loadedToken = null;
    pendingToken = null;
    return;
  }
  if (token === loadedToken || token === pendingToken) return;

  pendingToken = token;
  try {
    const { propertyIds } = await fetchContactedPropertyIds(token);
    if (getToken() !== token) return;
    contactedIds = new Set([...contactedIds, ...propertyIds]);
    loadedToken = token;
    emit();
  } catch {
    // Button stays clickable; the contact endpoint is idempotent per property
  } finally {
    if (pendingToken === token) pendingToken = null;
  }
}

export function useIsPropertyContacted(propertyId: string) {
  const ids = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const syncWithSession = () => void loadContactedIds();
    syncWithSession();
    window.addEventListener(SESSION_CHANGE_EVENT, syncWithSession);
    return () => window.removeEventListener(SESSION_CHANGE_EVENT, syncWithSession);
  }, []);

  return ids.has(propertyId);
}
