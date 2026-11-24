"use client";

import { useCallback, useMemo, useState } from "react";
import type { ShareListItem } from "@/components/landing/property-share/SharePropertiesModal";

// Selected items are kept by id so a pick survives page changes
export function useSavedPropertySelection() {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selected, setSelected] = useState<Map<string, ShareListItem>>(new Map());

  const start = useCallback(() => setIsSelecting(true), []);

  const clear = useCallback(() => setSelected(new Map()), []);

  const cancel = useCallback(() => {
    setIsSelecting(false);
    setSelected(new Map());
  }, []);

  const toggle = useCallback((item: ShareListItem) => {
    setSelected((current) => {
      const next = new Map(current);
      if (!next.delete(item.id)) next.set(item.id, item);
      return next;
    });
  }, []);

  const selectAll = useCallback((items: ShareListItem[]) => {
    setSelected((current) => new Map([...current, ...items.map((item) => [item.id, item] as const)]));
  }, []);

  const deselect = useCallback((id: string) => {
    setSelected((current) => {
      if (!current.has(id)) return current;
      const next = new Map(current);
      next.delete(id);
      return next;
    });
  }, []);

  const selectedItems = useMemo(() => [...selected.values()], [selected]);

  return { isSelecting, selected, selectedItems, start, cancel, clear, toggle, selectAll, deselect };
}
