"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError } from "@/services/apiClient";
import { getToken } from "@/services/session";
import {
  fetchContactedProperties,
  type ContactedAvailability,
  type ContactedProperty,
  type ContactedPropertiesSummary,
} from "@/services/userContactedProperties.service";
import { CONTACTED_PAGE_SIZE } from "./contactedPropertiesShared";

const LOGIN_PATH = "/login";
const LOAD_ERROR = "We could not load your contacted properties. Please try again.";

export function useContactedProperties() {
  const router = useRouter();
  const [availability, setAvailability] = useState<ContactedAvailability>("all");
  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);
  const [items, setItems] = useState<ContactedProperty[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<ContactedPropertiesSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push(LOGIN_PATH);
      return;
    }

    let cancelled = false;
    fetchContactedProperties({ page, limit: CONTACTED_PAGE_SIZE, availability }, token)
      .then((response) => {
        if (cancelled) return;
        setItems(response.items);
        setTotal(response.total);
        setSummary(response.summary);
        setError("");
      })
      .catch((failure: unknown) => {
        if (cancelled) return;
        if (failure instanceof ApiError && failure.status === 401) {
          router.push(LOGIN_PATH);
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
  }, [availability, page, reloadToken, router]);

  const changeAvailability = (next: ContactedAvailability) => {
    if (next === availability) return;
    setIsLoading(true);
    setPage(1);
    setAvailability(next);
  };

  const changePage = (next: number) => {
    setIsLoading(true);
    setPage(next);
  };

  const reload = () => {
    setIsLoading(true);
    setReloadToken((current) => current + 1);
  };

  return { availability, page, items, total, summary, isLoading, error, changeAvailability, changePage, reload };
}
