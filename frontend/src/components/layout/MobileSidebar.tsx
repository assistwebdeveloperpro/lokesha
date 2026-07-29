"use client";

import { ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  GUEST_ACTIVITY_LINKS,
  GUEST_SECONDARY_LINKS,
  LOGGED_IN_ACTIVITY_LINKS,
  LOGGED_IN_PREMIUM_LINK,
  LOGGED_IN_PROFILE_LINK,
  MAIN_NAV_ITEMS,
} from "./header-data";

type MobileSidebarProps = {
  open: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  userName: string;
  displayInitial: string;
  onLogout: () => void;
};

function UserAvatar({ initial }: { initial: string }) {
  return (
    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-200 text-base font-semibold text-slate-800">
      {initial}
    </span>
  );
}

export default function MobileSidebar({
  open,
  onClose,
  isLoggedIn,
  userName,
  displayInitial,
  onLogout,
}: MobileSidebarProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  const handleGuestMenuClick = () => {
    onClose();
    router.push("/login");
  };

  if (!mounted) return null;

  return createPortal(
    <div className="lg:hidden" id="mobile-sidebar">
      <div
        className={`fixed inset-0 z-100 bg-slate-900/50 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-101 flex w-[75%] max-w-xs flex-col bg-white font-semibold shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "pointer-events-none -translate-x-full"
        }`}
        aria-hidden={!open}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <button
          type="button"
          onClick={onClose}
          className={`absolute -right-10 top-3 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white transition ${
            open ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-label="Close menu"
          tabIndex={open ? 0 : -1}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="border-b border-slate-200 px-4 py-5">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <UserAvatar initial={displayInitial} />
              <div>
                <p className="font-semibold text-slate-900">{userName}</p>
                <Link
                  href="/user/dashboard"
                  onClick={onClose}
                  className="text-sm text-sky-700 hover:underline"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <p className="font-semibold text-slate-900">Welcome to Lokesha</p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push("/login");
                }}
                className="mt-2 cursor-pointer text-sm font-medium text-sky-700 hover:underline"
              >
                Login / Sign Up
              </button>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto" aria-label="Mobile navigation">
          <ul>
            {isLoggedIn && (
              <>
                <li className="border-b border-slate-100">
                  <Link
                    href={LOGGED_IN_PREMIUM_LINK.href}
                    onClick={onClose}
                    className="flex items-center px-4 py-3.5 text-sm text-slate-800"
                  >
                    {LOGGED_IN_PREMIUM_LINK.label}
                    {LOGGED_IN_PREMIUM_LINK.badge && (
                      <span className="ml-2 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none text-slate-900 bg-amber-400">
                        {LOGGED_IN_PREMIUM_LINK.badge}
                      </span>
                    )}
                  </Link>
                </li>

                <li className="border-b border-slate-100">
                  <div className="relative px-4 py-3">
                    <div className="border-t border-slate-200" aria-hidden />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs font-medium text-slate-500">
                      My Activity
                    </span>
                  </div>
                </li>

                {LOGGED_IN_ACTIVITY_LINKS.map((link) => (
                  <li key={link.href} className="border-b border-slate-100">
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className="flex items-center justify-between px-4 py-3.5 text-sm text-slate-800"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </>
            )}

            {!isLoggedIn && (
              <>
                <li className="border-b border-slate-100">
                  <div className="relative px-4 py-3">
                    <div className="border-t border-slate-200" aria-hidden />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs font-medium text-slate-500">
                      My Activity
                    </span>
                  </div>
                </li>

                {GUEST_ACTIVITY_LINKS.map((link) => (
                  <li key={link.href} className="border-b border-slate-100">
                    <button
                      type="button"
                      onClick={handleGuestMenuClick}
                      className="flex w-full cursor-pointer items-center px-4 py-3.5 text-left text-sm text-slate-800"
                    >
                      {link.label}
                      {link.badge && (
                        <span className="ml-2 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none text-slate-900 bg-amber-400">
                          {link.badge}
                        </span>
                      )}
                    </button>
                  </li>
                ))}

                <li className="border-b border-slate-100">
                  <div className="relative px-4 py-3">
                    <div className="border-t border-slate-200" aria-hidden />
                  </div>
                </li>

                {GUEST_SECONDARY_LINKS.map((link) => (
                  <li key={link.href} className="border-b border-slate-100">
                    <button
                      type="button"
                      onClick={handleGuestMenuClick}
                      className="flex w-full cursor-pointer items-center px-4 py-3.5 text-left text-sm text-slate-800"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </>
            )}

            {MAIN_NAV_ITEMS.map((item) => (
              <li key={item.href} className="border-b border-slate-100">
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center justify-between px-4 py-3.5 text-sm text-slate-800"
                >
                  <span className="inline-flex items-center">
                    {item.label}
                    {item.badge && (
                      <span className="ml-2 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none text-slate-900 bg-amber-400">
                        {item.badge}
                      </span>
                    )}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden />
                </Link>
              </li>
            ))}

            {isLoggedIn && (
              <>
                <li className="border-b border-slate-100 py-3">
                  <Link
                    href={LOGGED_IN_PROFILE_LINK.href}
                    onClick={onClose}
                    className="flex items-center justify-between px-4 py-3.5 text-sm text-slate-800"
                  >
                    {LOGGED_IN_PROFILE_LINK.label}
                  </Link>
                </li>
                <li className="border-b border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className="flex w-full cursor-pointer items-center px-4 py-3.5 text-left text-sm text-slate-800"
                  >
                    Sign Out
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-slate-200 bg-navy-blue p-4">
          <p className="text-sm font-semibold text-amber-400">
            Post Property for Free
          </p>
          <p className="mt-1 text-xs text-slate-300">
            List your property with zero commission
          </p>
          <Link
            href="/post-property"
            onClick={onClose}
            className="mt-3 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-semibold text-navy-blue transition hover:bg-slate-100"
          >
            Post Property
          </Link>
        </div>
      </aside>
    </div>,
    document.body,
  );
}
