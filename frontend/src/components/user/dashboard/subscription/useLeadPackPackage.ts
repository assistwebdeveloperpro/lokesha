"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/services/session";
import { fetchPackages, type PurchasablePackage } from "@/services/userSubscription.service";

// Only an active package is listed, so an inactive Buy More Leads package simply never appears
export function useLeadPackPackage() {
  const [leadPackPackage, setLeadPackPackage] = useState<PurchasablePackage | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    let cancelled = false;
    fetchPackages(token)
      .then(({ items }) => {
        if (!cancelled) setLeadPackPackage(items.find((item) => item.code === "leads") ?? null);
      })
      .catch(() => {
        // Buying extra leads is optional, so the page works without it
        if (!cancelled) setLeadPackPackage(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return leadPackPackage;
}
