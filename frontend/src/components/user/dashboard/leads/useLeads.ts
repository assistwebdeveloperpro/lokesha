"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ApiError } from "@/services/apiClient";
import { getToken } from "@/services/session";
import { fetchUserLeads, type UserLead } from "@/services/userLeads.service";
import { LEADS_PAGE_SIZE } from "./leadsShared";

const LOGIN_PATH = "/login";
const LOAD_ERROR = "We could not load your leads. Please try again.";

export function useLeads(focusLeadId: string | null = null) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);
  const [items, setItems] = useState<UserLead[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  // The lead is only sent on the first load, so later paging stays under the user's control
  const pendingLeadRef = useRef(focusLeadId);
  const skipNextFetchRef = useRef(false);

  useEffect(() => {
    // The page just adopted from the server already holds the loaded items
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false;
      return;
    }

    const token = getToken();
    if (!token) {
      router.push(LOGIN_PATH);
      return;
    }

    let cancelled = false;
    fetchUserLeads({ page, limit: LEADS_PAGE_SIZE, leadId: pendingLeadRef.current ?? undefined }, token)
      .then((response) => {
        if (cancelled) return;
        if (pendingLeadRef.current) {
          pendingLeadRef.current = null;
          if (response.page !== page) {
            skipNextFetchRef.current = true;
            setPage(response.page);
          }
        }
        setItems(response.items);
        setTotal(response.total);
        setError("");
        setIsLoading(false);
      })
      .catch((failure: unknown) => {
        if (cancelled) return;
        if (failure instanceof ApiError && failure.status === 401) {
          router.push(LOGIN_PATH);
          return;
        }
        setError(LOAD_ERROR);
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, reloadToken, router]);

  const changePage = (next: number) => {
    setIsLoading(true);
    setPage(next);
  };

  const reload = () => {
    setIsLoading(true);
    setReloadToken((current) => current + 1);
  };

  return { page, items, total, isLoading, error, changePage, reload };
}
