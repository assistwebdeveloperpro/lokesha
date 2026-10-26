"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import ManagePropertiesEmptyState from "./ManagePropertiesEmptyState";

export default function ManagePropertiesContent() {
  return (
    <div className="w-full px-4 py-0 sm:px-6 lg:px-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl lg:text-2xl font-bold text-slate-800">Manage Properties</h1>
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
        <ManagePropertiesEmptyState />
      </section>
    </div>
  );
}
