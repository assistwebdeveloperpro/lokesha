"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  getProfileDetails,
  type ProfileDetails,
} from "@/services/userProfile.service";

const actionLinkClass =
  "font-semibold text-sky-700 underline decoration-sky-700/30 underline-offset-2 transition hover:text-sky-600 hover:decoration-sky-600";

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
    <div className="grid grid-cols-1 border-b border-slate-100 last:border-b-0 sm:grid-cols-[minmax(10rem,14rem)_1fr]">
      <dt className="bg-slate-50 px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:border-r sm:border-slate-100 sm:px-5 sm:py-4 sm:text-sm sm:normal-case sm:tracking-normal">
        {label}
      </dt>
      <dd className="px-4 py-3.5 text-sm font-medium text-slate-900 sm:px-5 sm:py-4">
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
    <section aria-labelledby="profile-details-heading" className="max-w-3xl">
      <div className="mb-5">
        <h1
          id="profile-details-heading"
          className="font-display text-xl font-bold text-slate-900 sm:text-2xl"
        >
          Profile Details
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          View and manage your account information.
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
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
            <Link href="/user/profile/edit-login-details" className={actionLinkClass}>
              Add
            </Link>
          </ProfileRow>

          <ProfileRow label="Mobile">
            <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-2">
              {renderValue(profile?.mobile_number)}
              {profile?.mobile_number && (
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                  Verified
                </span>
              )}
              <Link
                href="/user/profile/edit-login-details"
                className={actionLinkClass}
              >
                Change Mobile
              </Link>
            </span>
          </ProfileRow>

          <ProfileRow label="Whatsapp No">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Link href="/user/profile/edit-login-details" className={actionLinkClass}>
                Add
              </Link>
              <label className="inline-flex cursor-not-allowed items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  disabled
                  className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 disabled:cursor-not-allowed"
                />
                Same as mobile number
              </label>
            </div>
          </ProfileRow>

          <ProfileRow label="Password">
            <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-slate-500">Not shown due to security reasons</span>
              <Link href="/user/profile/change-password" className={actionLinkClass}>
                Change Password
              </Link>
            </span>
          </ProfileRow>
        </dl>

        <div className="border-t border-slate-200 bg-slate-50 px-4 py-4 sm:px-5">
          <button
            type="button"
            className="text-sm font-medium border px-4 py-2 rounded-sm bg-linear-to-r-navy-blue text-white transition hover:text-white-700 hover:cursor-pointer"
          >
            Deactivate account
          </button>
        </div>
      </div>
    </section>
  );
}
