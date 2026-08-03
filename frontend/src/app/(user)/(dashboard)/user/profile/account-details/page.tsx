"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  getProfileDetails,
  type ProfileDetails,
} from "@/services/userProfile.service";

const actionLinkClass =
  "inline-flex w-full items-center justify-center rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-800 transition hover:border-sky-300 hover:bg-sky-100 sm:w-auto sm:justify-start sm:rounded-none sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:font-semibold sm:text-sky-700 sm:underline sm:decoration-sky-700/30 sm:underline-offset-2 sm:hover:bg-transparent sm:hover:text-sky-600 sm:hover:decoration-sky-600";

const ROLE_LABELS: Record<string, string> = {
  buyer: "Buyer",
  owner: "Owner",
  agent: "Agent",
  builder: "Builder",
};

function ProfileRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-1.5 border-b border-slate-200 px-4 py-4 sm:grid-cols-[minmax(10rem,14rem)_1fr] sm:gap-0 sm:px-0 sm:py-0">
      <dt className="text-sm font-semibold leading-snug text-slate-700 sm:border-r sm:border-slate-200 sm:bg-slate-50 sm:px-5 sm:py-4 sm:font-semibold sm:normal-case sm:tracking-normal sm:text-slate-500">
        {label}
      </dt>
      <dd className="min-w-0 text-sm font-medium leading-relaxed text-slate-900 sm:px-5 sm:py-4">
        {children}
      </dd>
    </div>
  );
}

export default function AccountDetailsPage() {
  const { token, isLoggedIn } = useAuth();
  const [profile, setProfile] = useState<ProfileDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn || !token) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    async function loadProfile() {
      try {
        const { profile } = await getProfileDetails(token!);
        if (!cancelled) setProfile(profile);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load profile details",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, token]);

  function renderValue(value?: string | null) {
    if (isLoading) {
      return <span className="text-slate-400">Loading…</span>;
    }
    if (!value) {
      return <span className="text-slate-400">—</span>;
    }
    return <span>{value}</span>;
  }

  return (
    <section aria-labelledby="profile-details-heading" className="w-full max-w-3xl">
      <div className="mb-5 sm:mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-600">
          Account settings
        </p>
        <h1
          id="profile-details-heading"
          className="mt-1 font-display text-xl font-bold text-slate-900 sm:text-2xl"
        >
          Profile Details
        </h1>
        <p className="profile-description mt-1.5 ">
          View and manage your account information.
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="overflow-hidden sm:rounded-xl sm:border sm:border-slate-200 sm:bg-white sm:shadow-sm">
        <dl>
          <ProfileRow label="Name">{renderValue(profile?.name)}</ProfileRow>

          <ProfileRow label="Company Name">
            {renderValue(profile?.company_name)}
          </ProfileRow>

          <ProfileRow label="Registered As">
            {renderValue(
              profile ? ROLE_LABELS[profile.role] ?? profile.role : undefined,
            )}
          </ProfileRow>

          <ProfileRow label="City">{renderValue(profile?.city)}</ProfileRow>

          <ProfileRow label="Email">{renderValue(profile?.email)}</ProfileRow>

          <ProfileRow label="Alternate Email">
            {isLoading ? (
              <span className="text-slate-400">Loading…</span>
            ) : profile?.alternate_email ? (
              <span>{profile.alternate_email}</span>
            ) : (
              <Link href="/user/profile/edit-login-details" className={actionLinkClass}>
                Add
              </Link>
            )}
          </ProfileRow>

          <ProfileRow label="Mobile">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {renderValue(profile?.mobile_number)}
                {profile?.mobile_number && (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                    Verified
                  </span>
                )}
              </div>
              <Link
                href="/user/profile/edit-login-details"
                className={actionLinkClass}
              >
                Change Mobile
              </Link>
            </div>
          </ProfileRow>

          <ProfileRow label="Whatsapp No">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2">
              <Link href="/user/profile/edit-login-details" className={actionLinkClass}>
                Add
              </Link>
              <label className="inline-flex cursor-not-allowed items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
                <input
                  type="checkbox"
                  disabled
                  className="h-4 w-4 shrink-0 rounded border-slate-300 text-sky-600 focus:ring-sky-500 disabled:cursor-not-allowed"
                />
                Same as mobile number
              </label>
            </div>
          </ProfileRow>

          <ProfileRow label="Password">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-1">
              <span className="text-sm text-slate-500">
                Not shown due to security reasons
              </span>
              <Link href="/user/profile/change-password" className={actionLinkClass}>
                Change Password
              </Link>
            </div>
          </ProfileRow>
        </dl>

        <div className="border-t border-slate-200 bg-slate-50 px-4 py-4 sm:px-5">
          <button
            type="button"
            className="w-full rounded-xl border px-4 py-2.5 text-sm font-medium bg-linear-to-r-navy-blue text-white transition hover:cursor-pointer hover:text-white-700 sm:w-auto  sm:py-2"
          >
            Deactivate account
          </button>
        </div>
      </div>
    </section>
  );
}
