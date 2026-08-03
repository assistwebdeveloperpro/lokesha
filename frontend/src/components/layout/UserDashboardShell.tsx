"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  getActiveNavLabel,
  getActiveSectionHref,
  getRestrictedNavRedirect,
  getUserDashboardNavItems,
  isNavItemActive,
} from "@/components/layout/user-dashboard-nav";
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
} from "@/components/ui/sidebar";

function initialFromName(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "U";
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

  const currentSection = useMemo(() => getActiveNavLabel(pathname, role), [pathname, role]);

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
    router.replace("/");
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
              <div>
                <p className="font-display text-md sm:text-xl font-bold ps-3 text-slate-900">{currentSection}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-slate-700">
                  {initialFromName(userName)}
                </span>
                <span className="hidden text-sm font-semibold text-slate-700 sm:inline">{userName}</span>
              </div>
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
