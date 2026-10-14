"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { ApiError } from "@/services/apiClient";
import {
  deleteProperty,
  getMyProperties,
  type PropertySummary,
} from "@/services/property.service";
import { getToken } from "@/services/session";
import DeletePropertyModal from "./DeletePropertyModal";
import ManagePropertiesEmptyState from "./ManagePropertiesEmptyState";
import PropertyCard from "./PropertyCard";
import PropertyCardSkeleton from "./PropertyCardSkeleton";
import { PROPERTIES_PAGE_SIZE, PROPERTY_GRID_CLASS } from "./manageProperties.shared";

export default function ManagePropertiesContent() {
  const router = useRouter();
  const { showToast } = useToast();

  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState<PropertySummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleApiError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) {
        router.push("/login");
        return null;
      }
      return err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
    },
    [router],
  );

  const loadPage = useCallback(
    async (nextPage: number) => {
      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const data = await getMyProperties(token, {
          page: nextPage,
          limit: PROPERTIES_PAGE_SIZE,
        });
        setProperties((current) =>
          nextPage === 1 ? data.properties : [...current, ...data.properties],
        );
        setTotal(data.total);
        setPage(nextPage);
        setError("");
      } catch (err) {
        const message = handleApiError(err);
        if (message === null) return;
        if (nextPage === 1) setError(message);
        else showToast(message, "error");
      }
    },
    [handleApiError, router, showToast],
  );

  const loadFirstPage = useCallback(async () => {
    setIsLoading(true);
    await loadPage(1);
    setIsLoading(false);
  }, [loadPage]);

  useEffect(() => {
    void loadFirstPage();
  }, [loadFirstPage]);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    await loadPage(page + 1);
    setIsLoadingMore(false);
  };

  const handleConfirmDelete = async () => {
    const token = getToken();
    if (!pendingDelete || !token) return;

    setIsDeleting(true);
    try {
      await deleteProperty(pendingDelete.id, token);
      setProperties((current) => current.filter((item) => item.id !== pendingDelete.id));
      setTotal((current) => Math.max(0, current - 1));
      showToast("Property deleted successfully", "success");
      setPendingDelete(null);
    } catch (err) {
      const message = handleApiError(err);
      if (message !== null) showToast(message, "error");
      setPendingDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const hasMore = properties.length < total;

  return (
    <div className="w-full px-4 py-0 sm:px-6 lg:px-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl lg:text-2xl font-bold text-slate-800">Manage Properties</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isLoading ? "Loading your properties..." : `${total} ${total === 1 ? "property" : "properties"} posted`}
          </p>
        </div>
        <Link
          href="/post-property"
          className="bg-linear-to-r-navy-blue inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Post New Property
        </Link>
      </header>

      <section className="mt-6">
        {isLoading ? (
          <div className={PROPERTY_GRID_CLASS}>
            {Array.from({ length: 6 }, (_, index) => (
              <PropertyCardSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-sm font-medium text-red-600">{error}</p>
            <button
              type="button"
              onClick={loadFirstPage}
              className="mt-4 min-h-10 cursor-pointer rounded-xl border border-red-300 px-5 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white"
            >
              Try again
            </button>
          </div>
        ) : properties.length === 0 ? (
          <ManagePropertiesEmptyState />
        ) : (
          <>
            <div className={PROPERTY_GRID_CLASS}>
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} onDelete={setPendingDelete} />
              ))}
            </div>
            {hasMore ? (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="min-h-10 cursor-pointer rounded-xl border border-navy-blue px-6 text-sm font-semibold text-navy-blue transition hover:bg-navy-blue hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoadingMore ? "Loading..." : "Load more"}
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>

      <DeletePropertyModal
        propertyName={pendingDelete?.projectName ?? null}
        isDeleting={isDeleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
