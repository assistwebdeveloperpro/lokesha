"use client";

import { useEffect, useSyncExternalStore } from "react";
import { fetchContactedPropertyIds } from "@/services/propertyContact.service";
import { getToken } from "@/services/session";

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
const getServerSnapshot = (): ReadonlySet<string> => new Set();

export function markPropertyContacted(propertyId: string) {
  if (contactedIds.has(propertyId)) return;
  contactedIds = new Set(contactedIds).add(propertyId);
  emit();
}

async function loadContactedIds() {
  const token = getToken();
  if (!token) {
    if (loadedToken !== null) {
      contactedIds = new Set();
      loadedToken = null;
      emit();
    }
    return;
  }
  if (token === loadedToken || token === pendingToken) return;

  pendingToken = token;
  try {
    const { propertyIds } = await fetchContactedPropertyIds(token);
    contactedIds = new Set([...contactedIds, ...propertyIds]);
    loadedToken = token;
    emit();
  } catch {
    // Button stays clickable; the contact endpoint is idempotent per property
  } finally {
    pendingToken = null;
  }
}

export function useIsPropertyContacted(propertyId: string) {
  const ids = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    void loadContactedIds();
  }, []);

  return ids.has(propertyId);
}
