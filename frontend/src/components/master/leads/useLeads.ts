"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { clearAdminSession, getAdminToken } from "@/services/adminSession";
import { fetchAdminLeads, type AdminLead, type AdminLeadsQuery } from "@/services/adminLeads.service";
import { ApiError } from "@/services/apiClient";
import { DEFAULT_LEAD_FILTERS, LEADS_PAGE_SIZE, type LeadFilters } from "./leadsShared";

const LOGIN_PATH = "/backend/login";
const LOAD_ERROR = "We could not load the leads. Please try again.";

const PHONE_QUERY: Record<LeadFilters["phone"], boolean | undefined> = {
  all: undefined,
  shared: true,
  hidden: false,
};

function toQuery(filters: LeadFilters, page: number): AdminLeadsQuery {
  return {
    page,
    limit: LEADS_PAGE_SIZE,
    search: filters.search || undefined,
    role: filters.role === "all" ? undefined : filters.role,
    phoneRevealed: PHONE_QUERY[filters.phone],
  };
}

export function useLeads() {
  const router = useRouter();
  const [filters, setFilters] = useState<LeadFilters>(DEFAULT_LEAD_FILTERS);
  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const expireSession = useCallback(() => {
    clearAdminSession();
    router.push(LOGIN_PATH);
  }, [router]);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.push(LOGIN_PATH);
      return;
    }

    let cancelled = false;
    fetchAdminLeads(toQuery(filters, page), token)
      .then((response) => {
        if (cancelled) return;
        setLeads(response.items);
        setTotal(response.total);
        setError("");
      })
      .catch((failure: unknown) => {
        if (cancelled) return;
        if (failure instanceof ApiError && failure.status === 401) {
          expireSession();
          return;
        }
        setError(LOAD_ERROR);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters, page, reloadToken, expireSession, router]);

  const applyFilters = (next: LeadFilters) => {
    setIsLoading(true);
    setPage(1);
    setFilters(next);
  };

  const changePage = (next: number) => {
    setIsLoading(true);
    setPage(next);
  };

  const reload = () => {
    setIsLoading(true);
    setReloadToken((current) => current + 1);
  };

  return { leads, total, page, filters, isLoading, error, applyFilters, changePage, reload };
}
