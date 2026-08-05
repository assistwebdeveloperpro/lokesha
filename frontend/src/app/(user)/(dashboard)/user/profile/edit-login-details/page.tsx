"use client";

import Link from "next/link";
import { ArrowLeft, Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/ToastProvider";
import { ApiError } from "@/services/apiClient";
import { getProfileDetails, updateLoginDetails } from "@/services/userProfile.service";

const USER_TYPE_LABELS: Record<string, string> = {
  buyer: "Buyer",
  owner: "Owner",
  agent: "Broker / Agent",
  builder: "Builder",
};

const COUNTRY_CODE_OPTIONS = [
  { value: "+91", label: "IND +91" },
  { value: "+1", label: "USA +1" },
  { value: "+44", label: "UK +44" },
];

const inputClassName =
  "w-full rounded-xl border bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 placeholder:font-normal border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20";

const selectClassName =
  "rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20";

type FormErrors = {
  name?: string;
  mobile?: string;
  alternateEmail?: string;
  terms?: string;
};

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
    <div className="grid grid-cols-1 gap-2 border-b border-slate-200 px-4 py-4 sm:grid-cols-[minmax(10rem,17rem)_1fr] sm:gap-0 sm:px-0 sm:py-0">
      <label
        htmlFor={htmlFor}
        className="text-sm font-semibold leading-snug text-slate-700 sm:border-r sm:border-slate-200 sm:bg-slate-50 sm:px-5 sm:py-4 sm:text-sm sm:font-semibold sm:normal-case sm:tracking-normal sm:text-slate-500"
      >
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
        <span className="hidden sm:inline"> :</span>
      </label>
      <div className="min-w-0 sm:bg-white sm:px-5 sm:py-4">{children}</div>
    </div>
  );
}

function YesNoRadioGroup({
  name,
  value,
  onChange,
  yesLabel = "Yes",
  noLabel = "No",
}: {
  name: string;
  value: "yes" | "no";
  onChange: (value: "yes" | "no") => void;
  yesLabel?: string;
  noLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
      {(["no", "yes"] as const).map((option) => (
        <label
          key={option}
          className="inline-flex cursor-pointer items-center gap-2.5 rounded-lg border border-transparent py-1 text-sm leading-snug text-slate-600 sm:py-0"
        >
          <input
            type="radio"
            name={name}
            value={option}
            checked={value === option}
            onChange={() => onChange(option)}
            className="h-4 w-4 shrink-0 border-slate-300 text-sky-600 focus:ring-sky-500"
          />
          {option === "yes" ? yesLabel : noLabel}
        </label>
      ))}
    </div>
  );
}

function CountryCodeDropdown({
  id,
  value,
  onChange,
  options,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full shrink-0 sm:w-36">
      <button
        id={id}
        type="button"
        aria-label="Country code"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={`${selectClassName} flex w-full cursor-pointer items-center justify-between gap-2`}
      >
        <span>{selectedOption.label}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>

      {isOpen ? (
        <ul
          role="listbox"
          aria-label="Country code"
          className="absolute left-0 z-30 mt-1 max-h-48 w-full min-w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg shadow-slate-900/10"
        >
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <li key={option.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition-colors ${
                    isSelected
                      ? "bg-sky-50 font-medium text-slate-800"
                      : "text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <span>{option.label}</span>
                  {isSelected ? (
                    <Check className="h-4 w-4 shrink-0 text-sky-600" aria-hidden />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function PhoneField({
  countryCodeId,
  phoneId,
  countryCode,
  phone,
  onCountryCodeChange,
  onPhoneChange,
  verified,
  error,
}: {
  countryCodeId: string;
  phoneId: string;
  countryCode: string;
  phone: string;
  onCountryCodeChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  verified?: boolean;
  error?: string;
}) {
  const hasError = Boolean(error);

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <CountryCodeDropdown
          id={countryCodeId}
          value={countryCode}
          onChange={onCountryCodeChange}
          options={COUNTRY_CODE_OPTIONS}
        />
        <div className="min-w-0 flex-1">
          <input
            id={phoneId}
            type="tel"
            value={phone}
            onChange={(event) => onPhoneChange(event.target.value)}
            aria-invalid={hasError}
            className={`${inputClassName} ${
              hasError
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : ""
            }`}
          />
          {verified ? (
            <p className="mt-1 text-xs font-semibold text-emerald-600">Verified</p>
          ) : null}
        </div>
      </div>
      {error ? (
        <p className="mt-1 text-xs text-red-500" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default function EditLoginDetailsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { token, isLoggedIn } = useAuth();

  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [name, setName] = useState("");
  const [alternateEmail, setAlternateEmail] = useState("");
  const [receiveOnAlternateEmail, setReceiveOnAlternateEmail] = useState(false);
  const [mobileCountryCode, setMobileCountryCode] = useState("+91");
  const [mobile, setMobile] = useState("");
  const [isMobileVerified] = useState(true);
  const [receiveSmsOnMobile, setReceiveSmsOnMobile] = useState(true);
  const [displayCountryCode, setDisplayCountryCode] = useState("+91");
  const [displayNumber, setDisplayNumber] = useState("");
  const [isPrimaryMobileVirtual, setIsPrimaryMobileVirtual] = useState<"yes" | "no">("no");
  const [hideContactDetails, setHideContactDetails] = useState<"yes" | "no">("no");
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !token) {
      setIsLoadingProfile(false);
      return;
    }

    let cancelled = false;

    async function loadProfile() {
      try {
        const { profile } = await getProfileDetails(token!);
        if (cancelled) return;

        setEmail(profile.email);
        setUserType(USER_TYPE_LABELS[profile.role] ?? profile.role);
        setName(profile.name ?? "");
        setAlternateEmail(profile.alternate_email ?? "");
        setReceiveOnAlternateEmail(profile.receive_on_alternate_email ?? false);
        setMobileCountryCode(profile.mobile_country_code ?? "+91");
        setMobile(profile.mobile_number ?? "");
        setReceiveSmsOnMobile(profile.receive_sms_on_mobile ?? true);
        setDisplayCountryCode(profile.display_country_code ?? "+91");
        setDisplayNumber(profile.display_number ?? "");
        setIsPrimaryMobileVirtual(profile.is_primary_mobile_virtual ? "yes" : "no");
        setHideContactDetails(profile.hide_contact_details ? "yes" : "no");
        setAgreedToTerms(profile.agreed_to_terms ?? true);
      } catch {
        if (!cancelled) {
          setEmail("");
          setUserType("");
        }
      } finally {
        if (!cancelled) setIsLoadingProfile(false);
      }
    }

    void loadProfile();

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

    if (!name.trim()) {
      nextErrors.name = "Name is required.";
    }

    if (!mobile.trim()) {
      nextErrors.mobile = "Mobile number is required.";
    } else if (!/^\d{10}$/.test(mobile.trim())) {
      nextErrors.mobile = "Please enter a valid 10-digit mobile number.";
    }

    if (alternateEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(alternateEmail.trim())) {
      nextErrors.alternateEmail = "Please enter a valid alternate email address.";
    }

    if (!agreedToTerms) {
      nextErrors.terms = "Please accept the terms and conditions to continue.";
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
      await updateLoginDetails(
        {
          name: name.trim(),
          alternateEmail: alternateEmail.trim(),
          receiveOnAlternateEmail,
          mobileCountryCode,
          mobile: mobile.trim(),
          receiveSmsOnMobile,
          displayCountryCode,
          displayNumber: displayNumber.trim(),
          isPrimaryMobileVirtual: isPrimaryMobileVirtual === "yes",
          hideContactDetails: hideContactDetails === "yes",
          agreedToTerms,
        },
        token
      );

      showToast("Login details saved successfully.");
      router.push("/user/profile/account-details");
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setErrors((current) => ({ ...current, mobile: error.message }));
      }
      showToast(
        error instanceof ApiError ? error.message : "Something went wrong. Please try again.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section aria-labelledby="edit-login-details-heading" className="w-full max-w-4xl">
      <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-600">
            Account settings
          </p>
          <h1
            id="edit-login-details-heading"
            className="mt-1 font-display text-xl font-bold text-slate-900 sm:text-2xl"
          >
            Edit Login Details
          </h1>
          <p className="profile-description mt-1.5">
            Update your login and contact information.
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
        <form onSubmit={handleSubmit} noValidate>
          <p className="profile-description-sm border-b border-slate-200 px-4 py-3 sm:px-5">
            <span className="text-red-500">*</span> denotes mandatory fields
          </p>

          <FormRow label="Email Id">
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700">
              {isLoadingProfile ? "Loading…" : email || "—"}
            </p>
          </FormRow>

          <FormRow label="User Type">
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700">
              {isLoadingProfile ? "Loading…" : userType || "—"}
            </p>
          </FormRow>

          <FormRow label="Name" required htmlFor="name">
            <div>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  clearError("name");
                }}
                aria-invalid={Boolean(errors.name)}
                className={`${inputClassName} ${
                  errors.name
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : ""
                }`}
              />
              {errors.name ? (
                <p className="mt-1 text-xs text-red-500" role="alert">
                  {errors.name}
                </p>
              ) : null}
            </div>
          </FormRow>

          <FormRow label="Alternate Email ID" htmlFor="alternate-email">
            <div className="space-y-3">
              <div>
                <input
                  id="alternate-email"
                  type="email"
                  value={alternateEmail}
                  onChange={(event) => {
                    setAlternateEmail(event.target.value);
                    clearError("alternateEmail");
                  }}
                  aria-invalid={Boolean(errors.alternateEmail)}
                  className={`${inputClassName} ${
                    errors.alternateEmail
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : ""
                  }`}
                />
                {errors.alternateEmail ? (
                  <p className="mt-1 text-xs text-red-500" role="alert">
                    {errors.alternateEmail}
                  </p>
                ) : null}
              </div>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-3 text-sm leading-relaxed text-slate-600 sm:border-transparent sm:bg-transparent sm:px-0 sm:py-0">
                <input
                  type="checkbox"
                  checked={receiveOnAlternateEmail}
                  onChange={(event) => setReceiveOnAlternateEmail(event.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <span>
                  Select this check box to receive emails on alternate email id
                </span>
              </label>
            </div>
          </FormRow>

          <FormRow label="Mobile" required>
            <div className="space-y-3">
              <PhoneField
                countryCodeId="mobile-country-code"
                phoneId="mobile"
                countryCode={mobileCountryCode}
                phone={mobile}
                onCountryCodeChange={setMobileCountryCode}
                onPhoneChange={(value) => {
                  setMobile(value);
                  clearError("mobile");
                }}
                verified={isMobileVerified && Boolean(mobile.trim())}
                error={errors.mobile}
              />
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-3 text-sm leading-relaxed text-slate-600 sm:border-transparent sm:bg-transparent sm:px-0 sm:py-0">
                <input
                  type="radio"
                  name="sms-mobile"
                  checked={receiveSmsOnMobile}
                  onChange={() => setReceiveSmsOnMobile(true)}
                  className="mt-0.5 h-4 w-4 shrink-0 border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <span>Select the mobile on which you want to receive SMS</span>
              </label>
            </div>
          </FormRow>

          <FormRow label="Display Number">
            <PhoneField
              countryCodeId="display-country-code"
              phoneId="display-number"
              countryCode={displayCountryCode}
              phone={displayNumber}
              onCountryCodeChange={setDisplayCountryCode}
              onPhoneChange={setDisplayNumber}
            />
          </FormRow>

          <FormRow label="Primary Mobile number is Virtual">
            <YesNoRadioGroup
              name="primary-mobile-virtual"
              value={isPrimaryMobileVirtual}
              onChange={setIsPrimaryMobileVirtual}
            />
          </FormRow>

          <FormRow label="Hide Contact Details">
            <div className="space-y-2">
              <YesNoRadioGroup
                name="hide-contact-details"
                value={hideContactDetails}
                onChange={setHideContactDetails}
                noLabel="No, show it to all users"
                yesLabel="Yes"
              />
              <p className="profile-description-sm rounded-lg bg-slate-50 px-3 py-2.5 sm:bg-transparent sm:px-0 sm:py-0">
                Please tick only if you do not want other users to see your contact details
                when they view your profile.
              </p>
            </div>
          </FormRow>

          <div className="border-b border-slate-200 px-4 py-4 sm:px-5 sm:py-4">
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-3.5 text-sm leading-relaxed text-slate-600 sm:border-transparent sm:bg-transparent sm:px-0 sm:py-0">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(event) => {
                  setAgreedToTerms(event.target.checked);
                  clearError("terms");
                }}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span>
                I agree to Lokesha&apos;s{" "}
                <Link href="/terms" className="font-medium text-sky-700 hover:text-sky-600">
                  Terms & Conditions
                </Link>
                . I would like to receive property related communication through Email, Call or
                SMS
              </span>
            </label>
            {errors.terms ? (
              <p className="mt-1 px-3 text-xs text-red-500 sm:px-0" role="alert">
                {errors.terms}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:justify-start sm:px-5">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-linear-to-r-navy-blue inline-flex w-full cursor-pointer items-center justify-center rounded-xl px-6 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-md shadow-slate-900/15 transition hover:shadow-slate-900/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:py-2.5"
            >
              {isSubmitting ? "Saving..." : "Save & Continue"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
