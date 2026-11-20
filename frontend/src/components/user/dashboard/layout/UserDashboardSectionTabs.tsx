"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  getActiveSectionHref,
  getUserDashboardNavItems,
  isNavItemActive,
} from "@/components/user/dashboard/layout/user-dashboard-nav";

export default function UserDashboardSectionTabs() {
  const pathname = usePathname();
  const { role } = useAuth();
  const activeTabRef = useRef<HTMLAnchorElement>(null);

  const section = useMemo(() => {
    const sectionHref = getActiveSectionHref(pathname, role);
    return getUserDashboardNavItems(role).find((item) => item.href === sectionHref);
  }, [pathname, role]);

  const tabs = section?.children ?? [];
  const SectionIcon = section?.icon;

  useEffect(() => {
    activeTabRef.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [pathname]);

  if (tabs.length < 2) return null;

  return (
    <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-4 sm:mx-6">
      <div className="mb-4 flex items-center gap-2.5">
        {SectionIcon && <SectionIcon className="h-5 w-5 shrink-0 text-sky-500" />}
        <h1 className="font-display text-xl font-bold text-slate-900">{section?.label}</h1>
      </div>
      <nav aria-label="Section tabs">
      <ul className="flex gap-3 overflow-x-auto overscroll-x-contain pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => {
          const isActive = isNavItemActive(pathname, tab.href, role);
          const TabIcon = tab.icon;

          return (
            <li key={tab.href} className="shrink-0">
              <Link
                ref={isActive ? activeTabRef : undefined}
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-2.5 whitespace-nowrap rounded-lg border px-5 py-2.5 sm:py-3.0 text-sm font-medium transition-colors duration-200",
                  isActive
                    ? "border-sky-500 font-semibold text-sky-600 bg-sky-50 [&_svg]:text-sky-600"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                )}
              >
                {TabIcon && <TabIcon className="h-4.5 w-4.5 shrink-0" />}
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
      </nav>
    </div>
  );
}
