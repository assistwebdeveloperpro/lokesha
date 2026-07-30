"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/ToastProvider";
import { ApiError } from "@/services/apiClient";
import { getProfileDetails } from "@/services/userProfile.service";
import { changePassword } from "@/services/userPassword.service";

type FormErrors = {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

const inputClassName =
  "w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20";

function FormRow({
  label,
  required,
  htmlFor,
  children,
}: {
  label: string;
  required?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 border-b border-slate-100 py-4 last:border-b-0 sm:grid-cols-[minmax(10rem,12rem)_1fr] sm:items-start sm:gap-6">
      <label
        htmlFor={htmlFor}
        className="text-sm font-semibold text-slate-700 sm:pt-2.5 sm:text-right"
      >
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
        <span className="hidden sm:inline"> :</span>
      </label>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function PasswordInput({
  id,
  value,
  placeholder,
  error,
  isPasswordVisible,
  onToggleVisibility,
  onChange,
}: {
  id: string;
  value: string;
  placeholder: string;
  error?: string;
  isPasswordVisible: boolean;
  onToggleVisibility: () => void;
  onChange: (value: string) => void;
}) {
  const hasError = Boolean(error);

  return (
    <div>
      <div className="relative">
        <input
          key={isPasswordVisible ? "visible" : "hidden"}
          id={id}
          type={isPasswordVisible ? "text" : "password"}
          value={value}
          placeholder={placeholder}
          required
          aria-invalid={hasError}
          onChange={(event) => onChange(event.target.value)}
          className={`${inputClassName} pr-20 ${
            hasError
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : ""
          }`}
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          aria-label={isPasswordVisible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 text-xs font-semibold uppercase tracking-wide text-sky-700 hover:text-sky-600"
        >
          {isPasswordVisible ? "Hide" : "Show"}
        </button>
      </div>
      {error ? (
        <p className="mt-1 text-xs text-red-500" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { token, isLoggedIn } = useAuth();

  const [email, setEmail] = useState("");
  const [isLoadingEmail, setIsLoadingEmail] = useState(true);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isOldPasswordVisible, setIsOldPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !token) {
      setIsLoadingEmail(false);
      return;
    }

    let cancelled = false;

    async function loadEmail() {
      try {
        const { profile } = await getProfileDetails(token!);
        if (!cancelled) setEmail(profile.email);
      } catch {
        if (!cancelled) setEmail("");
      } finally {
        if (!cancelled) setIsLoadingEmail(false);
      }
    }

    void loadEmail();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, token]);

  const clearError = (field: keyof FormErrors) => {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const nextErrors: FormErrors = {};

    if (!oldPassword.trim()) {
      nextErrors.oldPassword = "Old password is required.";
    }
    if (!newPassword.trim()) {
      nextErrors.newPassword = "New password is required.";
    } else if (newPassword.length < 8) {
      nextErrors.newPassword = "New password must be at least 8 characters.";
    }
    if (!confirmPassword.trim()) {
      nextErrors.confirmPassword = "Confirm password is required.";
    } else if (newPassword && confirmPassword !== newPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (!token) {
      showToast("Please login to continue.", "error");
      router.push("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      await changePassword({ oldPassword, newPassword, confirmPassword }, token);
      showToast("Password changed successfully.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) {
        if (/old password/i.test(error.message)) {
          setErrors({ oldPassword: error.message });
        } else if (/new password/i.test(error.message)) {
          setErrors({ newPassword: error.message });
        } else {
          showToast(error.message, "error");
        }
        return;
      }

      showToast(
        error instanceof ApiError ? error.message : "Something went wrong. Please try again.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section aria-labelledby="change-password-heading" className="max-w-3xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-600">
            Account security
          </p>
          <h1
            id="change-password-heading"
            className="mt-1 font-display text-xl font-bold text-slate-900 sm:text-2xl"
          >
            Change Password
          </h1>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-500">
            Update your password to keep your account secure.
          </p>
        </div>
        <Link
          href="/user/profile/account-details"
          className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to profile
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <form onSubmit={handleSubmit} noValidate className="px-4 sm:px-5">
          <p className="border-b border-slate-100 py-4 text-xs text-slate-500">
            (* denotes mandatory fields)
          </p>
          <FormRow label="Email ID" htmlFor="email-id">
            <input
              id="email-id"
              type="email"
              readOnly
              value={isLoadingEmail ? "Loading…" : email || "—"}
              className={`${inputClassName} cursor-default bg-slate-50 text-slate-700`}
            />
          </FormRow>

          <FormRow label="Old Password" required htmlFor="old-password">
            <PasswordInput
              id="old-password"
              placeholder="Enter your old password"
              value={oldPassword}
              onChange={(value) => {
                setOldPassword(value);
                clearError("oldPassword");
              }}
              error={errors.oldPassword}
              isPasswordVisible={isOldPasswordVisible}
              onToggleVisibility={() => setIsOldPasswordVisible((visible) => !visible)}
            />
          </FormRow>

          <FormRow label="New Password" required htmlFor="new-password">
            <PasswordInput
              id="new-password"
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(value) => {
                setNewPassword(value);
                clearError("newPassword");
                if (confirmPassword) clearError("confirmPassword");
              }}
              error={errors.newPassword}
              isPasswordVisible={isNewPasswordVisible}
              onToggleVisibility={() => setIsNewPasswordVisible((visible) => !visible)}
            />
          </FormRow>

          <FormRow label="Confirm Password" required htmlFor="confirm-password">
            <PasswordInput
              id="confirm-password"
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={(value) => {
                setConfirmPassword(value);
                clearError("confirmPassword");
              }}
              error={errors.confirmPassword}
              isPasswordVisible={isConfirmPasswordVisible}
              onToggleVisibility={() => setIsConfirmPasswordVisible((visible) => !visible)}
            />
          </FormRow>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 py-5 sm:flex-row sm:justify-end">
            <Link
              href="/user/profile/account-details"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-linear-to-r-navy-blue inline-flex cursor-pointer items-center justify-center rounded-xl px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-md shadow-slate-900/15 transition hover:shadow-slate-900/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
