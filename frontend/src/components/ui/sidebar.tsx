"use client";

import * as React from "react";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

const DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";

function subscribeToMediaQuery(query: string, callback: () => void) {
  const mediaQuery = window.matchMedia(query);
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getMediaQuerySnapshot(query: string) {
  return window.matchMedia(query).matches;
}

function useIsDesktop() {
  return useSyncExternalStore(
    (callback) => subscribeToMediaQuery(DESKTOP_MEDIA_QUERY, callback),
    () => getMediaQuerySnapshot(DESKTOP_MEDIA_QUERY),
    () => false,
  );
}

type SidebarContextValue = {
  open: boolean;
  isDesktop: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider.");
  }
  return context;
}

export function SidebarProvider({
  defaultOpen = true,
  children,
  className,
}: React.PropsWithChildren<{ defaultOpen?: boolean; className?: string }>) {
  const isDesktop = useIsDesktop();
  const [openDesktop, setOpenDesktop] = React.useState(defaultOpen);
  const [openMobile, setOpenMobile] = React.useState(false);
  const open = isDesktop ? openDesktop : openMobile;
  const setOpen = React.useCallback(
    (value: React.SetStateAction<boolean>) => {
      if (isDesktop) {
        setOpenDesktop(value);
      } else {
        setOpenMobile(value);
      }
    },
    [isDesktop],
  );
  const toggleSidebar = React.useCallback(() => {
    if (isDesktop) {
      setOpenDesktop((prev) => !prev);
    } else {
      setOpenMobile((prev) => !prev);
    }
  }, [isDesktop]);

  React.useEffect(() => {
    if (!isDesktop) {
      setOpenMobile(false);
    }
  }, [isDesktop]);

  return (
    <SidebarContext.Provider value={{ open, isDesktop, setOpen, toggleSidebar }}>
      <div
        data-slot="sidebar-wrapper"
        data-state={open ? "expanded" : "collapsed"}
        className={cn("group/sidebar-wrapper flex min-h-screen w-full", className)}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function Sidebar({
  className,
  children,
}: React.PropsWithChildren<{ className?: string }>) {
  const { open } = useSidebar();

  return (
    <aside
      data-slot="sidebar"
      data-state={open ? "expanded" : "collapsed"}
      data-collapsible={open ? "" : "icon"}
      className={cn(
        "relative h-screen shrink-0 border-r border-navy-sidebar bg-navy-sidebar text-slate-100 transition-[width] duration-300 max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-50 max-lg:hidden data-[state=expanded]:max-lg:flex max-lg:flex-col lg:sticky lg:top-0 lg:flex lg:flex-col",
        open ? "w-68" : "w-20",
        className
      )}
    >
      {children}
    </aside>
  );
}

export function SidebarHeader({
  className,
  children,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div data-slot="sidebar-header" className={cn("border-b border-navy-sidebar p-3", className)}>
      {children}
    </div>
  );
}

export function SidebarContent({
  className,
  children,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div
      data-slot="sidebar-content"
      className={cn(
        "flex-1 overflow-y-auto p-3 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SidebarSeparator({ className }: { className?: string }) {
  return <div data-slot="sidebar-separator" className={cn("mx-3 h-px bg-navy-sidebar-separator", className)} />;
}

export function SidebarFooter({
  className,
  children,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div data-slot="sidebar-footer" className={cn("border-t border-navy-sidebar p-3", className)}>
      {children}
    </div>
  );
}

export function SidebarRail({ className }: { className?: string }) {
  const { open, toggleSidebar } = useSidebar();

  return (
    <button
      type="button"
      aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
      onClick={toggleSidebar}
      data-slot="sidebar-rail"
      className={cn(
        "absolute -right-2 top-20 hidden h-10 w-2 rounded-full bg-slate-200/80 transition hover:bg-slate-300 lg:block",
        className
      )}
    />
  );
}

export function SidebarInset({
  className,
  children,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <section data-slot="sidebar-inset" className={cn("flex min-w-0 flex-1 flex-col", className)}>
      {children}
    </section>
  );
}

export function SidebarGroup({
  className,
  children,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div data-slot="sidebar-group" className={cn("space-y-2", className)}>
      {children}
    </div>
  );
}

export function SidebarGroupLabel({
  className,
  children,
}: React.PropsWithChildren<{ className?: string }>) {
  const { open } = useSidebar();
  if (!open) return null;

  return (
    <p
      data-slot="sidebar-group-label"
      className={cn("px-2 text-xs font-semibold uppercase tracking-wide text-slate-400", className)}
    >
      {children}
    </p>
  );
}

export function SidebarGroupContent({
  className,
  children,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div data-slot="sidebar-group-content" className={className}>
      {children}
    </div>
  );
}

export function SidebarMenu({
  className,
  children,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <ul data-slot="sidebar-menu" className={cn("space-y-3.5", className)}>
      {children}
    </ul>
  );
}

export function SidebarMenuItem({
  className,
  children,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <li data-slot="sidebar-menu-item" className={cn("group/menu-item", className)}>
      {children}
    </li>
  );
}

export function SidebarMenuSubCollapsible({
  open,
  className,
  children,
}: React.PropsWithChildren<{ open: boolean; className?: string }>) {
  return (
    <div
      data-slot="sidebar-menu-sub-collapsible"
      data-state={open ? "open" : "closed"}
      className={cn(
        "grid transition-[grid-template-rows] duration-200 ease-out",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        className
      )}
    >
      <div className="min-h-0 overflow-hidden">
        <div
          className={cn(
            "transition-opacity duration-200 ease-out",
            open ? "opacity-100" : "opacity-0"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function SidebarMenuSub({
  className,
  children,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      className={cn("mt-1 space-y-1 border-l border-navy-sidebar pl-3", className)}
    >
      {children}
    </ul>
  );
}

export function SidebarMenuSubItem({
  className,
  children,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <li data-slot="sidebar-menu-sub-item" className={className}>
      {children}
    </li>
  );
}

export function SidebarMenuSubButton({
  asChild = false,
  className,
  isActive,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  isActive?: boolean;
}) {
  const classes = cn(
    "flex w-full items-center rounded-xl px-2 py-2.5 text-left text-sm font-medium transition",
    isActive
      ? "bg-navy-sidebar-active text-white"
      : "text-slate-200 hover:bg-white/10 hover:text-white",
    className
  );

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ className?: string; title?: string }>;
    return React.cloneElement(child, {
      className: cn(classes, child.props.className),
    });
  }

  return (
    <button
      data-slot="sidebar-menu-sub-button"
      data-active={isActive ? "true" : "false"}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
}

export function SidebarMenuButton({
  asChild = false,
  className,
  isActive,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  isActive?: boolean;
}) {
  const { open } = useSidebar();
  const classes = cn(
    "group flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left text-sm font-medium transition hover:cursor-pointer",
    isActive
      ? "bg-navy-sidebar-active text-white"
      : "text-slate-200 hover:bg-white/10 hover:text-white",
    !open && "mx-auto h-10 w-10 justify-center gap-0 px-0 py-0",
    className
  );

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ className?: string; title?: string }>;
    return React.cloneElement(child, {
      className: cn(classes, child.props.className),
    });
  }

  return (
    <button
      data-slot="sidebar-menu-button"
      data-active={isActive ? "true" : "false"}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
}

export function SidebarTrigger({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      data-slot="sidebar-trigger"
      type="button"
      onClick={toggleSidebar}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-200 transition hover:bg-white/10 hover:cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

