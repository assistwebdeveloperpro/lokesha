"use client";

import { Package } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/shared/ui/ToastProvider";
import type { SubscriptionPackage } from "@/services/adminSubscription.service";
import EditPackageDrawer from "./EditPackageDrawer";
import PackageCard from "./PackageCard";
import PackageHistoryModal from "./PackageHistoryModal";
import PackagesSkeleton from "./PackagesSkeleton";
import { useSubscriptionPackages } from "./useSubscriptionPackages";

export default function SubscriptionPackagesContent() {
  const { showToast } = useToast();
  const { packages, isLoading, error, reload, savePackage } = useSubscriptionPackages();
  const [editing, setEditing] = useState<SubscriptionPackage | null>(null);
  const [viewingHistory, setViewingHistory] = useState<SubscriptionPackage | null>(null);

  return (
    <div className="w-full px-1 py-0 sm:px-6 lg:px-6">
      <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="bg-linear-to-r-navy-blue flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md sm:h-11 sm:w-11">
            <Package className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-base font-bold text-slate-800 sm:text-lg lg:text-xl">Subscription Packages</h1>
            <p className="text-xs text-slate-500 sm:text-sm">Manage the subscription packages offered to users</p>
          </div>
        </div>
        {!isLoading && !error ? (
          <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-200 sm:px-3.5 sm:py-1.5 sm:text-sm">
            {packages.length} {packages.length === 1 ? "package" : "packages"}
          </span>
        ) : null}
      </header>

      <section className="mt-4 sm:mt-6" aria-live="polite">
        {isLoading ? (
          <PackagesSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center rounded-2xl border border-slate-200/90 bg-white px-6 py-14 text-center shadow-sm">
            <p className="text-sm font-medium text-red-600" role="alert">
              {error}
            </p>
            <button
              type="button"
              onClick={reload}
              className="bg-linear-to-r-navy-blue mt-5 min-h-10 cursor-pointer rounded-xl px-6 text-sm font-semibold text-white shadow-md"
            >
              Try again
            </button>
          </div>
        ) : packages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-sm font-medium text-slate-500">
            No packages are set up yet.
          </div>
        ) : (
          <ul className="grid gap-4 sm:gap-6 xl:grid-cols-2">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} onEdit={setEditing} onViewHistory={setViewingHistory} />
            ))}
          </ul>
        )}
      </section>

      {editing ? (
        <EditPackageDrawer
          pkg={editing}
          onClose={() => setEditing(null)}
          onSave={async (input) => {
            const result = await savePackage(editing.id, input);
            if (result.ok) {
              showToast(result.message, "success");
              setEditing(null);
            }
            return result;
          }}
        />
      ) : null}

      {viewingHistory ? <PackageHistoryModal pkg={viewingHistory} onClose={() => setViewingHistory(null)} /> : null}
    </div>
  );
}
