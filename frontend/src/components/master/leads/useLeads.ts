"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { clearAdminSession, getAdminToken } from "@/services/adminSession";
import {
  fetchAdminLeads,
  sendLeadToLister,
  type AdminLead,
  type AdminLeadsQuery,
} from "@/services/adminLeads.service";
import { ApiError } from "@/services/apiClient";
import { applySentLead, DEFAULT_LEAD_FILTERS, LEADS_PAGE_SIZE, type LeadFilters } from "./leadsShared";

const LOGIN_PATH = "/backend/login";
const LOAD_ERROR = "We could not load the leads. Please try again.";
const SEND_ERROR = "We could not send the lead. Please try again.";

type SendError = { id: string; message: string };

const PHONE_QUERY: Record<LeadFilters["phone"], boolean | undefined> = {
  all: undefined,
  shared: true,
  hidden: false,
};

const allToUndefined = (value: string) => (value === "all" || value === "" ? undefined : value);

function toQuery(filters: LeadFilters, page: number): AdminLeadsQuery {
  return {
    page,
    limit: LEADS_PAGE_SIZE,
    search: filters.search || undefined,
    phoneRevealed: PHONE_QUERY[filters.phone],
    verificationStatus: allToUndefined(filters.verification) as AdminLeadsQuery["verificationStatus"],
    listedBy: allToUndefined(filters.listedBy),
    propertyType: allToUndefined(filters.propertyType),
    listingType: allToUndefined(filters.listingType),
  };
}

export function useLeads(focusLeadId: string | null = null) {
  const router = useRouter();
  const [filters, setFilters] = useState<LeadFilters>(DEFAULT_LEAD_FILTERS);
  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sendError, setSendError] = useState<SendError | null>(null);
  // The lead is only sent on the first load, so later paging and filtering stay under the admin's control
  const pendingLeadRef = useRef(focusLeadId);
  const skipNextFetchRef = useRef(false);

  const expireSession = useCallback(() => {
    clearAdminSession();
    router.push(LOGIN_PATH);
  }, [router]);

  useEffect(() => {
    // The page just adopted from the server already holds the loaded leads
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false;
      return;
    }

    const token = getAdminToken();
    if (!token) {
      router.push(LOGIN_PATH);
      return;
    }

    let cancelled = false;
    fetchAdminLeads({ ...toQuery(filters, page), leadId: pendingLeadRef.current ?? undefined }, token)
      .then((response) => {
        if (cancelled) return;
        if (pendingLeadRef.current) {
          pendingLeadRef.current = null;
          if (response.page !== page) {
            skipNextFetchRef.current = true;
            setPage(response.page);
          }
        }
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

  const sendLead = async (id: string) => {
    const token = getAdminToken();
    if (!token) {
      router.push(LOGIN_PATH);
      return;
    }

    setSendingId(id);
    setSendError(null);
    try {
      const sent = await sendLeadToLister(id, token);
      setLeads((current) => applySentLead(current, sent));
    } catch (failure: unknown) {
      if (failure instanceof ApiError && failure.status === 401) {
        expireSession();
        return;
      }
      setSendError({ id, message: failure instanceof ApiError ? failure.message : SEND_ERROR });
    } finally {
      setSendingId(null);
    }
  };

  return {
    leads,
    total,
    page,
    filters,
    isLoading,
    error,
    sendingId,
    sendError,
    applyFilters,
    changePage,
    reload,
    sendLead,
  };
}
