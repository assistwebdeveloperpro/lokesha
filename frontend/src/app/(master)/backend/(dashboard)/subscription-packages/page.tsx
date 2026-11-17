import { Package } from "lucide-react";

export default function MasterSubscriptionPackagesPage() {
  return (
    <div className="w-full px-1 py-0 sm:px-6 lg:px-6">
      <header className="flex items-center gap-3">
        <span className="bg-linear-to-r-navy-blue flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md">
          <Package className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </span>
        <div>
          <h1 className="font-display text-lg font-bold text-slate-800 lg:text-xl">Subscription Packages</h1>
          <p className="text-sm text-slate-500">Manage the subscription packages offered to users</p>
        </div>
      </header>
    </div>
  );
}
