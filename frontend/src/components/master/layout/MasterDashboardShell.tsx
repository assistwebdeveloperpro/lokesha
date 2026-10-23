"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Home,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { setRedirectToast } from "@/components/shared/ui/redirectToast";
import { cn } from "@/lib/utils";
import {
  getMasterActiveNavLabel,
  getMasterActiveSectionHref,
  isMasterNavItemActive,
  masterDashboardNavItems,
} from "@/components/master/layout/master-dashboard-nav";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubCollapsible,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/shared/ui/sidebar";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return "A";
}

function MasterProfileMenu({
  adminName,
  onSignOut,
}: {
  adminName: string;
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const initials = initialsFromName(adminName);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        close();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, close]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1.5 shadow-sm transition hover:bg-slate-50 sm:gap-2.5 sm:px-3"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Account menu for ${adminName}`}
      >
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-linear-to-r-navy-blue text-xs font-bold text-white sm:h-8 sm:w-8 sm:text-sm">
          {initials}
        </span>
        <span className="hidden max-w-35 truncate text-sm font-semibold text-slate-700 sm:inline">
          {adminName}
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <p className="px-4 py-3.5 text-base font-bold text-slate-900">Hi, {adminName}</p>
          <div className="border-t border-slate-100 p-2">
            <button
              type="button"
              onClick={() => {
                close();
                onSignOut();
              }}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-linear-to-r-navy-blue py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 active:scale-[0.99]"
            >
              <LogOut className="h-4 w-4" strokeWidth={2} aria-hidden />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MasterDashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen className="h-screen overflow-hidden">
      <MasterDashboardShellInner>{children}</MasterDashboardShellInner>
    </SidebarProvider>
  );
}

function MasterDashboardShellInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { adminName, logout } = useAdminAuth();
  const { open, isDesktop, setOpen } = useSidebar();
  // const currentSection = getMasterActiveNavLabel(pathname);
  const activeSectionHref = useMemo(
    () => getMasterActiveSectionHref(pathname),
    [pathname],
  );
  const [expandedSectionHref, setExpandedSectionHref] = useState<string | null>(
    activeSectionHref,
  );

  useEffect(() => {
    if (activeSectionHref) {
      setExpandedSectionHref(activeSectionHref);
    }
  }, [activeSectionHref]);

  const toggleSection = (href: string) => {
    setExpandedSectionHref((current) => (current === href ? null : href));
  };

  const closeSidebarOnMobile = () => {
    if (!isDesktop) {
      setOpen(false);
    }
  };

  const handleLogout = () => {
    closeSidebarOnMobile();
    logout();
    setRedirectToast("Signed out successfully.");
    router.replace("/backend/login");
  };

  return (
    <div className="flex h-full w-full bg-[#f7f8fb] text-slate-900">
      <Sidebar>
        <SidebarHeader className="relative h-16 p-0">
          <div
            className={cn(
              "flex h-full items-center",
              open ? "pr-14 lg:pr-4" : "justify-center px-3",
            )}
          >
            <Link
              href="/"
              aria-label="Lokesha home"
              className={cn(
                "flex items-center",
                open
                  ? "min-w-0 flex-1 gap-2 rounded-md px-2 py-1.5"
                  : "mx-auto h-10 w-10 justify-center",
              )}
            >
              {open ? (
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20">
                  <Home className="h-4 w-4 text-sky-300" />
                </span>
              ) : (
                <Home className="h-5 w-5 shrink-0 text-sky-300" />
              )}
              {open && (
                <span className="font-display truncate text-lg font-semibold text-white">
                  Lokesha
                </span>
              )}
            </Link>
            <button
              type="button"
              aria-label="Close sidebar"
              className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-white/10 text-slate-100 shadow-sm backdrop-blur transition hover:bg-white/20 hover:text-white active:scale-95 lg:hidden"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {masterDashboardNavItems.map((item) => {
                  const ItemIcon = item.icon;
                  const hasChildren = Boolean(item.children?.length);
                  const isExpanded = expandedSectionHref === item.href;

                  return (
                    <SidebarMenuItem key={item.label}>
                      {hasChildren && open ? (
                        <SidebarMenuButton
                          type="button"
                          aria-expanded={isExpanded}
                          aria-label={isExpanded ? `Collapse ${item.label}` : `Expand ${item.label}`}
                          onClick={() => toggleSection(item.href)}
                          className="justify-between gap-2"
                        >
                          <span className="flex min-w-0 flex-1 items-center gap-3 font-semibold">
                            <ItemIcon className="h-5 w-5 shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </span>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 shrink-0 text-slate-300 transition-transform duration-200",
                              isExpanded && "rotate-180",
                            )}
                          />
                        </SidebarMenuButton>
                      ) : (
                        <SidebarMenuButton
                          asChild
                          isActive={!hasChildren && isMasterNavItemActive(pathname, item.href)}
                        >
                          <Link
                            href={item.href}
                            title={!open ? item.label : undefined}
                            onClick={closeSidebarOnMobile}
                          >
                            <ItemIcon className="h-5 w-5 shrink-0" />
                            {open && <span className="truncate">{item.label}</span>}
                          </Link>
                        </SidebarMenuButton>
                      )}

                      {open && hasChildren && (
                        <SidebarMenuSubCollapsible open={isExpanded}>
                          <SidebarMenuSub>
                            {item.children!.map((child) => (
                              <SidebarMenuSubItem key={`${item.label}-${child.label}`}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isMasterNavItemActive(pathname, child.href)}
                                  className="font-semibold"
                                >
                                  <Link href={child.href} onClick={closeSidebarOnMobile}>
                                    <span className="truncate">{child.label}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </SidebarMenuSubCollapsible>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarSeparator />
        <SidebarFooter>
          <SidebarMenuButton
            type="button"
            onClick={handleLogout}
            title={!open ? "Sign out" : undefined}
            className="font-semibold"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {open && "Sign Out"}
          </SidebarMenuButton>
        </SidebarFooter>
      </Sidebar>

      {open && !isDesktop && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <SidebarInset className="min-h-0 overflow-hidden">
        <header className="z-30 shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <SidebarTrigger
                aria-label={
                  isDesktop
                    ? open
                      ? "Collapse sidebar"
                      : "Expand sidebar"
                    : open
                      ? "Close sidebar"
                      : "Open sidebar"
                }
                className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              >
                {isDesktop ? (
                  open ? (
                    <ChevronLeft className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )
                ) : open ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </SidebarTrigger>
              {/* <p className="font-display text-md sm:text-xl font-bold ps-3 text-slate-900">
                {currentSection}
              </p> */}
            </div>

            <MasterProfileMenu adminName={adminName} onSignOut={handleLogout} />
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,.04)] sm:p-5">
            {children}
          </div>
        </main>
      </SidebarInset>
    </div>
  );
}
