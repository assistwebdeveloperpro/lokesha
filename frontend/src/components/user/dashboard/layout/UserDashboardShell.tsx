"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Home,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { setRedirectToast } from "@/components/shared/ui/redirectToast";
import { cn } from "@/lib/utils";
import NotificationBell from "@/components/user/dashboard/notifications/NotificationBell";
import {
  getActiveNavLabel,
  getActiveSectionHref,
  getRestrictedNavRedirect,
  getUserDashboardNavItems,
  isNavItemActive,
} from "@/components/user/dashboard/layout/user-dashboard-nav";
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
  return "U";
}

function UserDashboardProfileMenu({
  userName,
  onSignOut,
}: {
  userName: string;
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const initials = initialsFromName(userName);

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
        aria-label={`Account menu for ${userName}`}
      >
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-linear-to-r-navy-blue text-xs font-bold text-white sm:h-8 sm:w-8 sm:text-sm">
          {initials}
        </span>
        <span className="hidden max-w-35 truncate text-sm font-semibold text-slate-700 sm:inline">
          {userName}
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <p className="px-4 py-3.5 text-base font-bold text-slate-900">
            Hi, {userName}
          </p>
          <div className="border-t border-slate-100" />

          <nav className="py-0" aria-label="Account shortcuts">
            <Link
              href="/"
              onClick={close}
              className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100">
                <Home className="h-4 w-4 text-slate-600" strokeWidth={2} aria-hidden />
              </span>
              Home
            </Link>
            <Link
              href="/user/profile/account-details"
              onClick={close}
              className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100">
                <User className="h-4 w-4 text-slate-600" strokeWidth={2} aria-hidden />
              </span>
              My Profile
            </Link>
          </nav>

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

export default function UserDashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen className="h-screen overflow-hidden">
      <UserDashboardShellInner>{children}</UserDashboardShellInner>
    </SidebarProvider>
  );
}

function UserDashboardShellInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { userName = "User", logout, role } = useAuth();
  const { open, isDesktop, setOpen } = useSidebar();
  const navItems = useMemo(() => getUserDashboardNavItems(role), [role]);
  const activeSectionHref = useMemo(
    () => getActiveSectionHref(pathname, role),
    [pathname, role]
  );
  const [expandedSectionHref, setExpandedSectionHref] = useState<string | null>(activeSectionHref);

  useEffect(() => {
    if (activeSectionHref) {
      setExpandedSectionHref(activeSectionHref);
    }
  }, [activeSectionHref]);

  // const currentSection = useMemo(() => getActiveNavLabel(pathname, role), [pathname, role]);

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
    router.replace("/login");
  };

  const handleNavClick = (
    href: string,
    event: React.MouseEvent<HTMLAnchorElement>
  ) => {
    const redirectTo = getRestrictedNavRedirect(href, role);
    closeSidebarOnMobile();

    if (redirectTo) {
      event.preventDefault();
      router.push(redirectTo);
    }
  };

  return (
    <div className="flex h-full w-full bg-[#f7f8fb] text-slate-900">
      <Sidebar>
        <SidebarHeader className="relative h-16 p-0">
          <div
            className={cn(
              "flex h-full items-center",
              open ? "pr-14 lg:pr-4" : "justify-center px-3"
            )}
          >
            <Link
              href="/"
              onClick={closeSidebarOnMobile}
              className={cn(
                "flex items-center transition hover:bg-white/10",
                open
                  ? "min-w-0 flex-1 gap-2 rounded-md px-2 py-1.5"
                  : "mx-auto h-10 w-10 justify-center rounded-xl px-0 py-0"
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
                {navItems.map((item) => {
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
                              isExpanded && "rotate-180"
                            )}
                          />
                        </SidebarMenuButton>
                      ) : (
                        <SidebarMenuButton
                          asChild
                          isActive={!hasChildren && isNavItemActive(pathname, item.href, role)}
                        >
                          <Link
                            href={item.href}
                            title={!open ? item.label : undefined}
                            onClick={(event) => handleNavClick(item.href, event)}
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
                                  isActive={isNavItemActive(pathname, child.href, role)}
                                  className="font-semibold"
                                >
                                  <Link
                                    href={child.href}
                                    onClick={(event) => handleNavClick(child.href, event)}
                                  >
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
              {/* <div>
                <p className="font-display text-md sm:text-xl font-bold ps-3 text-slate-900">{currentSection}</p>
              </div> */}
            </div>

            <div className="flex items-center gap-3">
              <NotificationBell />
              <UserDashboardProfileMenu userName={userName} onSignOut={handleLogout} />
            </div>
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
