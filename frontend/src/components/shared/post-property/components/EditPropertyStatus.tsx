import Link from "next/link";
import { usePostPropertyMode } from "../config/postPropertyMode";

export default function EditPropertyStatus({ error }: { error: string }) {
  const { managePath } = usePostPropertyMode();

  if (!error) {
    return (
      <div
        className="mx-auto w-full max-w-360 animate-pulse space-y-4 px-4 py-10"
        aria-busy="true"
      >
        <div className="h-8 w-64 rounded bg-slate-200" />
        <div className="h-5 w-full rounded bg-slate-100" />
        <div className="h-96 rounded-2xl bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-16 text-center">
      <p className="text-sm font-medium text-red-600">{error}</p>
      <Link
        href={managePath}
        className="bg-linear-to-r-navy-blue mt-6 inline-flex min-h-10 items-center rounded-xl px-6 text-sm font-semibold text-white shadow-md"
      >
        Back to Manage Properties
      </Link>
    </div>
  );
}