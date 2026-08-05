"use client";

import { ChevronDown, Home, HousePlus, Menu } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  GUEST_ACTIVITY_LINKS,
  GUEST_SECONDARY_LINKS,
  LOGGED_IN_ACTIVITY_LINKS,
  LOGGED_IN_PREMIUM_LINK,
  LOGGED_IN_PROFILE_LINK,
  MAIN_NAV_ITEMS,
} from "./header-data";
import MobileSidebar from "@/components/layout/MobileSidebar";

function FreeBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded px-1 py-0.5 text-[9px] font-bold uppercase leading-none tracking-wide text-slate-900 bg-amber-400 ${className}`}
    >
      FREE
    </span>
  );
}

function NewBadge() {
  return (
    <span className="ml-1.5 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wide text-slate-900 bg-amber-400">
      NEW
    </span>
  );
}

function PostPropertyButton({ compact = false }: { compact?: boolean }) {
  const iconSize = compact ? "h-4 w-4" : "h-[18px] w-[18px]";
  const iconPadding = compact
    ? "pl-2.5 pr-2 sm:pl-3 sm:pr-2.5"
    : "pl-3 pr-2.5 sm:pl-3.5 sm:pr-3";
  const textPadding = compact
    ? "pl-2 pr-3 sm:pl-2.5 sm:pr-4"
    : "pl-2.5 pr-4 sm:pl-3 sm:pr-5";

  return (
    <Link
      href="/post-property"
      className={`group relative inline-flex shrink-0 items-center rounded-full border border-white/20 bg-white font-semibold text-navy-blue shadow-sm transition hover:bg-slate-50 ${
        compact
          ? "h-8 text-xs sm:h-9 sm:text-sm"
          : "h-9 text-sm sm:h-10"
      }`}
    >
      <span className={`inline-flex items-center ${iconPadding}`}>
        <HousePlus className={iconSize} strokeWidth={2} aria-hidden />
      </span>
      <span className="h-4 w-px shrink-0 bg-slate-300" aria-hidden />
      <span className={`inline-flex items-center ${textPadding}`}>
        Post Property
      </span>
      <FreeBadge className="absolute -right-1 -top-2 sm:-right-1.5 sm:-top-2.5" />
    </Link>
  );
}

function UserAvatar({
  initial,
  size = "md",
}: {
  initial: string;
  size?: "sm" | "md";
}) {
  const sizeClass = size === "sm" ? "h-7 w-7 text-xs" : "h-8 w-8 text-sm";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-sky-200 font-semibold text-slate-800 ${sizeClass}`}
    >
      {initial}
    </span>
  );
}

function GuestDropdown({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-lg border border-slate-200 bg-white py-2 shadow-xl sm:w-72">
      <MenuSectionDivider label="My Activity" />

      <ul>
        {GUEST_ACTIVITY_LINKS.map((link) => (
          <li key={link.href}>
            <ProfileMenuLink
              href={link.href}
              label={link.label}
              badge={link.badge}
              onClose={onClose}
              requireLogin
            />
          </li>
        ))}
      </ul>

      <div className="mx-4 border-t border-slate-200" />

      <ul>
        {GUEST_SECONDARY_LINKS.map((link) => (
          <li key={link.href}>
            <ProfileMenuLink
              href={link.href}
              label={link.label}
              badge={link.badge}
              onClose={onClose}
              requireLogin
            />
          </li>
        ))}
      </ul>

      <div className="p-4 pt-2">
        <button
          type="button"
          onClick={() => {
            onClose();
            router.push("/login");
          }}
          className="w-full cursor-pointer rounded-lg bg-linear-to-r-navy-blue py-3 text-sm font-semibold text-white transition hover:opacity-95"
        >
          Login / Sign Up
        </button>
      </div>
    </div>
  );
}

function MenuSectionDivider({ label }: { label: string }) {
  return (
    <div className="relative px-4 py-3">
      <div className="border-t border-slate-200" aria-hidden />
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs font-medium text-slate-500">
        {label}
      </span>
    </div>
  );
}

function ProfileMenuLink({
  href,
  label,
  badge,
  onClose,
  requireLogin = false,
}: {
  href: string;
  label: string;
  badge?: "NEW";
  onClose: () => void;
  requireLogin?: boolean;
}) {
  const router = useRouter();
  const className =
    "flex w-full items-center px-4 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50 hover:text-sky-700";

  if (requireLogin) {
    return (
      <button
        type="button"
        onClick={() => {
          onClose();
          router.push("/login");
        }}
        className={`${className} cursor-pointer text-left`}
      >
        {label}
        {badge === "NEW" && <NewBadge />}
      </button>
    );
  }

  return (
    <Link href={href} onClick={onClose} className={className}>
      {label}
      {badge === "NEW" && <NewBadge />}
    </Link>
  );
}

function LoggedInDropdown({
  onClose,
  onLogout,
}: {
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-lg border border-slate-200 bg-white py-2 shadow-xl sm:w-72">
      <ProfileMenuLink
        href={LOGGED_IN_PREMIUM_LINK.href}
        label={LOGGED_IN_PREMIUM_LINK.label}
        badge={LOGGED_IN_PREMIUM_LINK.badge}
        onClose={onClose}
      />

      <MenuSectionDivider label="My Activity" />

      <ul>
        {LOGGED_IN_ACTIVITY_LINKS.map((link) => (
          <li key={link.href}>
            <ProfileMenuLink
              href={link.href}
              label={link.label}
              badge={link.badge}
              onClose={onClose}
            />
          </li>
        ))}
      </ul>

      <div className="mx-4 border-t border-slate-200" />

      <div className="py-3">
        <ProfileMenuLink
          href={LOGGED_IN_PROFILE_LINK.href}
          label={LOGGED_IN_PROFILE_LINK.label}
          onClose={onClose}
        />
      </div>

      <div className="mx-4 border-t border-slate-200" />

      <button
        type="button"
        onClick={() => {
          onClose();
          onLogout();
        }}
        className="w-full cursor-pointer px-4 py-3 text-left text-sm font-medium text-slate-800 transition hover:bg-slate-50 hover:text-sky-700"
      >
        Sign Out
      </button>
    </div>
  );
}

function DesktopUserMenu({
  isLoggedIn,
  userName,
  displayInitial,
  onLogout,
}: {
  isLoggedIn: boolean;
  userName: string;
  displayInitial: string;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
        className="inline-flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-white transition hover:bg-white/10"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {isLoggedIn ? (
          <>
            <UserAvatar initial={displayInitial} size="sm" />
            <span className="hidden sm:inline">Hi, {userName}</span>
          </>
        ) : (
          <span>Login</span>
        )}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open &&
        (isLoggedIn ? (
          <LoggedInDropdown onClose={close} onLogout={onLogout} />
        ) : (
          <GuestDropdown onClose={close} />
        ))}
    </div>
  );
}

export default function Header() {
  const { isLoggedIn, userName, displayInitial, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full">
        {/* Primary bar */}
        <div className="bg-navy-blue shadow-md shadow-slate-950/10 py-1">
          <div className="mx-auto flex h-12 max-w-360 items-center justify-between gap-3 px-4 sm:h-14 lg:h-13">
            {/* Mobile / tablet: hamburger + Home logo */}
            <div className="flex items-center gap-3 lg:hidden">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-white transition hover:bg-white/10"
                aria-label="Open menu"
                aria-expanded={sidebarOpen}
                aria-controls="mobile-sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>

              <Link href="/" className="flex items-center" aria-label="Lokesha home">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/25">
                  <Home className="h-4 w-4 text-sky-300" aria-hidden />
                </span>
              </Link>
            </div>

            {/* Desktop: logo */}
            <Link
              href="/"
              className="group hidden items-center gap-2.5 transition-opacity hover:opacity-90 lg:flex"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/25">
                <Home className="h-4 w-4 text-sky-300" aria-hidden />
              </span>
              <span className="font-display text-2xl font-bold tracking-tight text-white">
                Lokesha
              </span>
            </Link>

            {/* Right actions */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="hidden lg:block">
                <DesktopUserMenu
                  isLoggedIn={isLoggedIn}
                  userName={userName}
                  displayInitial={displayInitial}
                  onLogout={handleLogout}
                />
              </div>

              <PostPropertyButton compact />
            </div>
          </div>
        </div>

        {/* Secondary nav - desktop only */}
        <nav
          className="hidden border-b border-slate-200 bg-white lg:block"
          aria-label="Main navigation"
        >
          <div className="mx-auto flex h-11 max-w-360 items-center gap-6 px-6">
            {MAIN_NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-1 rounded-md px-3 py-2 font-medium text-slate-700 transition hover:bg-slate-50 hover:text-sky-700"
              >
                {item.label}
                {item.badge && <NewBadge />}
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <MobileSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isLoggedIn={isLoggedIn}
        userName={userName}
        displayInitial={displayInitial}
        onLogout={handleLogout}
      />
    </>
  );
}
