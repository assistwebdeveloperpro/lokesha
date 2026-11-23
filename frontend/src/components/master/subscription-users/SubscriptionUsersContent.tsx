"use client";

import { Users } from "lucide-react";
import { useState } from "react";
import ListPagination from "@/components/shared/ui/ListPagination";
import type { AdminUserRow } from "@/services/adminSubscription.service";
import UserDetailDrawer from "./UserDetailDrawer";
import UsersFilterBar from "./UsersFilterBar";
import UsersTable from "./UsersTable";
import UsersTableSkeleton from "./UsersTableSkeleton";
import { USERS_PAGE_SIZE, isFiltered } from "./usersShared";
import { useSubscriptionUsers } from "./useSubscriptionUsers";

export default function SubscriptionUsersContent() {
  const { items, total, page, filters, isLoading, error, applyFilters, changePage, reload, refresh } = useSubscriptionUsers();
  const [selected, setSelected] = useState<AdminUserRow | null>(null);

  return (
    <div className="w-full px-1 py-0 sm:px-6 lg:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="bg-linear-to-r-navy-blue flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md">
            <Users className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div>
            <h1 className="font-display text-lg font-bold text-slate-800 lg:text-xl">User Subscriptions</h1>
            <p className="text-sm text-slate-500">Credits, validity and payments of every user</p>
          </div>
        </div>
        {!isLoading && !error ? (
          <span className="inline-flex items-center rounded-full bg-sky-50 px-3.5 py-1.5 text-sm font-semibold text-sky-700 ring-1 ring-sky-200">
            {total} {total === 1 ? "user" : "users"}
          </span>
        ) : null}
      </header>

      <UsersFilterBar applied={filters} onApply={applyFilters} />

      <section className="mt-6" aria-live="polite">
        {isLoading ? (
          <UsersTableSkeleton />
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
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <p className="font-display text-base font-bold text-slate-700">{isFiltered(filters) ? "No users match these filters" : "No users yet"}</p>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {isFiltered(filters) ? "Try a different name, package or status." : "Users appear here once they register."}
            </p>
          </div>
        ) : (
          <>
            <UsersTable users={items} onView={setSelected} />
            <ListPagination page={page} pageSize={USERS_PAGE_SIZE} total={total} onPageChange={changePage} />
          </>
        )}
      </section>

      {selected ? <UserDetailDrawer user={selected} onClose={() => setSelected(null)} onChanged={refresh} /> : null}
    </div>
  );
}
