import { Building2 } from "lucide-react";
import Link from "next/link";

export default function ManagePropertiesEmptyState() {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 text-sky-600">
        <Building2 className="h-8 w-8" aria-hidden />
      </span>
      <h2 className="mt-4 text-lg font-bold text-slate-800">
        You haven&apos;t posted any property yet
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Post your first property and reach buyers and tenants.
      </p>
      <Link
        href="/post-property"
        className="bg-linear-to-r-navy-blue mt-6 inline-flex min-h-10 items-center rounded-xl px-6 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
      >
        Post your first property
      </Link>
    </div>
  );
}
