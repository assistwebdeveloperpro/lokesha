"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError } from "@/services/apiClient";
import { getPropertyById, type PropertyDetail } from "@/services/property.service";
import { getToken } from "@/services/session";

type UseEditPropertyResult = {
  property: PropertyDetail | null;
  isLoading: boolean;
  error: string;
};

// Loads the property being edited; does nothing when editId is null
export function useEditProperty(editId: string | null): UseEditPropertyResult {
  const router = useRouter();
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(editId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editId) {
      return;
    }

    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    let isCancelled = false;

    getPropertyById(editId, token)
      .then((data) => {
        if (!isCancelled) setProperty(data.property);
      })
      .catch((err) => {
        if (isCancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          router.push("/login");
          return;
        }
        setError(
          err instanceof ApiError && err.status === 404
            ? "Property not found."
            : "Unable to load this property. Please try again.",
        );
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [editId, router]);

  return { property, isLoading, error };
}
