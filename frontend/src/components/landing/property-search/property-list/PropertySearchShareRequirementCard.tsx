"use client";

import { Check, ChevronDown, ClipboardList, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import CustomDropdown, { type DropdownOption } from "@/components/shared/CustomDropdown";
import {
  ALL_INDIA_LABEL,
  DEFAULT_SELECTED_CITY,
} from "@/components/shared/layout/city-selector/citySelector.shared";
import { useHeaderCity } from "@/components/shared/layout/city-selector/useHeaderCity";
import { useToast } from "@/components/shared/ui/ToastProvider";
import { INDIAN_CITIES } from "@/data/indianCities";
import { CATEGORIES } from "@/components/landing/home/hero-banner/heroBanner.shared";
import {
  LANDING_CATEGORY_SLUGS,
  type LandingCategory,
} from "@/lib/property-search-url/landingUrl.config";
import { setPostLoginRedirect } from "@/lib/postLoginRedirect";
import {
  CATEGORY_ID_BY_SLUG,
  CATEGORY_TRANSACTIONS,
} from "@/lib/property-search-url/searchUrl.config";
import type {
  CategorySlug,
  PropertySearchCriteria,
  TransactionSlug,
} from "@/lib/property-search-url/searchUrl.types";
import type { PropertyTypeId } from "@/components/shared/post-property/config/postPropertyForm.shared";
import { ApiError } from "@/services/apiClient";
import {
  submitPropertyRequirement,
  type PropertyRequirementPayload,
} from "@/services/propertySearch.service";
import { clearSession, getToken } from "@/services/session";
import {
  getCategoryFilters,
  includesValue,
  type FilterOption,
} from "../searchFilterOptions";
import { urlPropertyTypeToSubTypeId } from "../more-filters/moreFilterContext";
import { getCityLocalities } from "../search-filter-bar/searchTopLocalities";
import {
  clearRequirementDraft,
  loadRequirementDraft,
  saveRequirementDraft,
  type RequirementDraft,
} from "./requirementDraft";

const TRANSACTION_LABEL: Record<TransactionSlug, string> = {
  "property-for-sale": "Buy",
  "property-for-rent": "Rent",
  "property-for-lease": "Lease",
};

const CATEGORY_OPTIONS: DropdownOption[] = (
  Object.entries(LANDING_CATEGORY_SLUGS) as [LandingCategory, CategorySlug][]
).map(([id, value]) => ({
  value,
  label: CATEGORIES.find((category) => category.id === id)?.label ?? id,
}));

const DROPDOWN_MENU =
  "z-50 max-h-60 overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg shadow-slate-900/10";

const dropdownCell =
  "min-w-0 [&_button>span]:min-w-0 [&_button>span]:truncate [&_button]:overflow-hidden";

type PropertySearchShareRequirementCardProps = {
  criteria: PropertySearchCriteria;
};

function canonicalCity(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return DEFAULT_SELECTED_CITY;
  return (
    INDIAN_CITIES.find((city) => city.toLowerCase() === trimmed.toLowerCase()) ??
    trimmed
  );
}

function matchedSubtypeValues(selected: string[], category: CategorySlug): string[] {
  return getCategoryFilters(category)
    .propertyTypeOptions.filter((option) => includesValue(selected, option.value))
    .map((option) => option.value);
}

const SUBMIT_FAILED_MESSAGE = "Unable to submit your requirement. Please try again.";
const LOGIN_REQUIRED_MESSAGE = "Please login to share your requirement.";

function toRequirementPayload(draft: RequirementDraft): PropertyRequirementPayload {
  const propertyType = CATEGORY_ID_BY_SLUG[draft.category];

  return {
    listingType: draft.transaction === "property-for-sale" ? "sale" : "rent-lease",
    propertyType,
    city: draft.city,
    localities: draft.localities,
    subTypes: draft.subtypes.map(
      (value) =>
        urlPropertyTypeToSubTypeId(propertyType as PropertyTypeId, value) ??
        value.toLowerCase(),
    ),
    requirement: draft.description.trim(),
  };
}

function nextTransaction(
  current: TransactionSlug,
  category: CategorySlug,
): TransactionSlug {
  const allowed = CATEGORY_TRANSACTIONS[category];
  return allowed.includes(current) ? current : allowed[0];
}

function RequirementLocalityField({
  city,
  localities,
  hasError,
  onChange,
}: {
  city: string;
  localities: string[];
  hasError: boolean;
  onChange: (next: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const knownLocalities = useMemo(() => getCityLocalities(city), [city]);

  useEffect(() => {
    setQuery("");
    setOpen(false);
  }, [city]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const suggestions = useMemo(() => {
    const selected = new Set(localities.map((item) => item.toLowerCase()));
    const needle = query.trim().toLowerCase();
    return knownLocalities
      .filter((name) => !selected.has(name.toLowerCase()))
      .filter((name) => (needle ? name.toLowerCase().includes(needle) : true))
      .slice(0, 8);
  }, [knownLocalities, localities, query]);

  const addLocality = (name: string) => {
    const trimmed = name.trim().replace(/\s+/g, " ");
    if (!trimmed) return;
    if (localities.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
      setQuery("");
      setOpen(false);
      return;
    }
    onChange([...localities, trimmed]);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <div
        className={`flex min-h-11 w-full flex-wrap items-center gap-1 rounded-xl border bg-white py-1.5 pl-2.5 pr-9 shadow-sm transition focus-within:ring-2 ${
          hasError
            ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20"
            : "border-slate-200/90 focus-within:border-sky-500 focus-within:ring-sky-500/20"
        }`}
      >
        {localities.map((name) => (
          <span
            key={name}
            className="inline-flex max-w-full items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
          >
            <span className="truncate">{name}</span>
            <button
              type="button"
              aria-label={`Remove ${name}`}
              onClick={() => onChange(localities.filter((item) => item !== name))}
              className="cursor-pointer text-slate-500 hover:text-slate-800"
            >
              <X className="h-3 w-3" aria-hidden />
            </button>
          </span>
        ))}
        <input
          id="requirement-locality"
          value={query}
          aria-label="Select locality"
          aria-invalid={hasError}
          autoComplete="off"
          placeholder={localities.length === 0 ? "Select Locality *" : ""}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            const needle = query.trim().toLowerCase();
            if (!needle) return;
            const exact = knownLocalities.find((name) => name.toLowerCase() === needle);
            const prefix = suggestions.find((name) =>
              name.toLowerCase().startsWith(needle),
            );
            addLocality(exact ?? prefix ?? query);
          }}
          className="min-w-16 flex-1 bg-transparent py-1 text-sm font-medium text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400"
        />
        <Search
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
      </div>
      {open && suggestions.length > 0 ? (
        <ul className="absolute z-30 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg shadow-slate-900/10">
          {suggestions.map((name) => (
            <li key={name}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => addLocality(name)}
                className="flex w-full cursor-pointer px-3 py-2 text-left text-sm text-slate-800 hover:bg-slate-50"
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {hasError ? (
        <p className="mt-1 text-xs text-red-600">Select a locality</p>
      ) : null}
    </div>
  );
}

function RequirementSubtypeField({
  options,
  selected,
  onChange,
}: {
  options: FilterOption[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const toggle = (value: string) => {
    onChange(
      includesValue(selected, value)
        ? selected.filter((item) => !includesValue([item], value))
        : [...selected, value],
    );
  };

  return (
    <div ref={rootRef} className="relative min-w-0">
      <div
        role="combobox"
        tabIndex={0}
        aria-label="Property subtype"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          setOpen((current) => !current);
        }}
        className="flex min-h-11 w-full cursor-pointer items-center rounded-xl border border-slate-200/90 bg-white py-1 pl-1.5 pr-1 shadow-sm outline-none focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-500/20"
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
          {selected.length === 0 ? (
            <span className="px-1.5 text-sm text-slate-400">Select</span>
          ) : (
            selected.map((value) => {
              const label =
                options.find((option) => option.value === value)?.label ?? value;
              return (
                <span
                  key={value}
                  className="inline-flex max-w-full items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                >
                  <span className="truncate">{label}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${label}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggle(value);
                    }}
                    className="cursor-pointer text-slate-500 hover:text-slate-800"
                  >
                    <X className="h-3 w-3" aria-hidden />
                  </button>
                </span>
              );
            })
          )}
        </div>
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center text-slate-400">
          <ChevronDown
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        </span>
      </div>
      {open ? (
        <ul
          role="listbox"
          aria-label="Property subtype"
          aria-multiselectable="true"
          className="absolute z-30 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg shadow-slate-900/10"
        >
          {options.map((option) => {
            const isSelected = includesValue(selected, option.value);
            return (
              <li key={option.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => toggle(option.value)}
                  className={`flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-left text-sm ${
                    isSelected
                      ? "bg-sky-100 font-medium text-slate-900"
                      : "text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <span className="truncate">{option.label}</span>
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

function ShareRequirementHeaderArt() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgb(148 163 184 / 0.45) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-sky-200/50 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-navy-blue/10 blur-2xl"
      />
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 320 112"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <path
          d="M0 72h320M0 48h320M0 96h320"
          stroke="#cbd5e1"
          strokeWidth="1"
          strokeDasharray="4 6"
          opacity="0.55"
        />
        <path
          d="M64 0v112M160 0v112M256 0v112"
          stroke="#cbd5e1"
          strokeWidth="1"
          strokeDasharray="4 6"
          opacity="0.4"
        />
        <path
          d="M-20 58c52-18 88 22 142 8s90-38 158-6 72 14 98-12"
          stroke="#94a3b8"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.55"
        />
        <path
          d="M12 86c48 10 92-14 148 4s78 22 148-8"
          stroke="#94a3b8"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.45"
        />
        <rect x="24" y="62" width="28" height="38" rx="4" fill="#e2e8f0" opacity="0.9" />
        <rect x="58" y="72" width="22" height="28" rx="3" fill="#cbd5e1" opacity="0.85" />
        <rect x="228" y="58" width="32" height="42" rx="4" fill="#e2e8f0" opacity="0.9" />
        <rect x="266" y="68" width="24" height="32" rx="3" fill="#cbd5e1" opacity="0.85" />
        <circle cx="92" cy="44" r="5" fill="#12192b" opacity="0.12" />
        <circle cx="92" cy="44" r="2.5" fill="#12192b" opacity="0.35" />
        <circle cx="228" cy="36" r="5" fill="#0ea5e9" opacity="0.15" />
        <circle cx="228" cy="36" r="2.5" fill="#0284c7" opacity="0.45" />
      </svg>
    </>
  );
}

function ShareRequirementHeader() {
  return (
    <div className="relative h-28 overflow-hidden border-b border-slate-200/80 bg-linear-to-br from-sky-100/80 via-sky-50 to-slate-100">
      <ShareRequirementHeaderArt />
      <div className="relative z-10 flex h-full items-center justify-center">
        <div className="relative">
          <span
            aria-hidden
            className="absolute inset-0 -m-1 rounded-2xl bg-navy-blue/15 blur-md"
          />
          <span
            aria-hidden
            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-white shadow-sm ring-2 ring-white"
          >
            <Search className="h-2.5 w-2.5" strokeWidth={2.5} />
          </span>
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-slate-200/90">
            <ClipboardList className="h-7 w-7 text-navy-blue" strokeWidth={1.75} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PropertySearchShareRequirementCard({
  criteria,
}: PropertySearchShareRequirementCardProps) {
  const router = useRouter();
  const headerCity = useHeaderCity();
  const { showToast } = useToast();
  const cityFromSearch = canonicalCity(
    criteria.cityName ??
      (headerCity !== ALL_INDIA_LABEL ? headerCity : DEFAULT_SELECTED_CITY),
  );
  const searchSignature = [
    criteria.transaction,
    criteria.category,
    cityFromSearch,
    criteria.localities.join("\u0001"),
    criteria.propertyTypes.join("\u0001"),
  ].join("\u0002");

  const snapshotRef = useRef({ criteria, cityFromSearch });
  snapshotRef.current = { criteria, cityFromSearch };

  const [transaction, setTransaction] = useState(criteria.transaction);
  const [category, setCategory] = useState(criteria.category);
  const [city, setCity] = useState(cityFromSearch);
  const [localities, setLocalities] = useState(criteria.localities);
  const [subtypes, setSubtypes] = useState(() =>
    matchedSubtypeValues(criteria.propertyTypes, criteria.category),
  );
  const [description, setDescription] = useState("");
  const [localityError, setLocalityError] = useState(false);
  const [descriptionError, setDescriptionError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const draft = loadRequirementDraft(window.location.href);
    if (draft) {
      setTransaction(draft.transaction);
      setCategory(draft.category);
      setCity(draft.city);
      setLocalities(draft.localities);
      setSubtypes(draft.subtypes);
      setDescription(draft.description);
      return;
    }

    const current = snapshotRef.current;
    setTransaction(current.criteria.transaction);
    setCategory(current.criteria.category);
    setCity(current.cityFromSearch);
    setLocalities(current.criteria.localities);
    setSubtypes(
      matchedSubtypeValues(current.criteria.propertyTypes, current.criteria.category),
    );
    setLocalityError(false);
  }, [searchSignature]);

  const transactionOptions = useMemo(
    () =>
      CATEGORY_TRANSACTIONS[category].map((value) => ({
        value,
        label: TRANSACTION_LABEL[value],
      })),
    [category],
  );

  const subtypeOptions = useMemo(
    () => getCategoryFilters(category).propertyTypeOptions,
    [category],
  );

  const cityOptions = useMemo(() => {
    const known = INDIAN_CITIES.some(
      (name) => name.toLowerCase() === city.toLowerCase(),
    );
    const names = known ? INDIAN_CITIES : [city, ...INDIAN_CITIES];
    return names.map((name) => ({ value: name, label: name }));
  }, [city]);

  const handleCategoryChange = (value: string) => {
    const next = value as CategorySlug;
    setCategory(next);
    setTransaction((current) => nextTransaction(current, next));
    setSubtypes([]);
  };

  const redirectToLogin = (draft: RequirementDraft) => {
    saveRequirementDraft(draft, window.location.href);
    setPostLoginRedirect(`${window.location.pathname}${window.location.search}`);
    showToast(LOGIN_REQUIRED_MESSAGE, "error");
    router.push("/login");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const missingLocality = localities.length === 0;
    const missingDescription = description.trim().length === 0;
    setLocalityError(missingLocality);
    setDescriptionError(missingDescription);
    if (missingLocality || missingDescription || isSubmitting) return;

    const draft: RequirementDraft = { transaction, category, city, localities, subtypes, description };
    const token = getToken();
    if (!token) {
      redirectToLogin(draft);
      return;
    }

    setIsSubmitting(true);
    try {
      const { message } = await submitPropertyRequirement(toRequirementPayload(draft), token);
      showToast(message);
      clearRequirementDraft();
      setDescription("");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearSession();
        redirectToLogin(draft);
        return;
      }
      const message =
        error instanceof ApiError ? (error.errors?.[0] ?? error.message) : SUBMIT_FAILED_MESSAGE;
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <ShareRequirementHeader />
      <form className="space-y-3 p-4" onSubmit={handleSubmit}>
        <div>
          <h3 className="text-base font-bold text-slate-900">Share your requirements</h3>
          <p className="mt-1 text-sm text-slate-600">
            Describe what you need and we will help you find matching properties.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className={dropdownCell}>
            <CustomDropdown
              id="requirement-transaction"
              ariaLabel="Transaction"
              variant="boxed"
              value={transaction}
              options={transactionOptions}
              menuClassName={DROPDOWN_MENU}
              onChange={(value) => setTransaction(value as TransactionSlug)}
            />
          </div>
          <div className={dropdownCell}>
            <CustomDropdown
              id="requirement-city"
              ariaLabel="City"
              variant="boxed"
              value={city}
              options={cityOptions}
              menuClassName={DROPDOWN_MENU}
              onChange={(value) => {
                setCity(canonicalCity(value));
                setLocalities([]);
                setLocalityError(false);
              }}
            />
          </div>
        </div>

        <RequirementLocalityField
          city={city}
          localities={localities}
          hasError={localityError}
          onChange={(next) => {
            setLocalities(next);
            if (next.length > 0) setLocalityError(false);
          }}
        />

        <div
          className={`grid gap-2 ${subtypeOptions.length > 0 ? "grid-cols-2" : "grid-cols-1"}`}
        >
          <div className={dropdownCell}>
            <CustomDropdown
              id="requirement-category"
              ariaLabel="Property type"
              variant="boxed"
              value={category}
              options={CATEGORY_OPTIONS}
              menuClassName={DROPDOWN_MENU}
              onChange={handleCategoryChange}
            />
          </div>
          {subtypeOptions.length > 0 ? (
            <RequirementSubtypeField
              key={category}
              options={subtypeOptions}
              selected={subtypes}
              onChange={setSubtypes}
            />
          ) : null}
        </div>

        <div>
          <input
            id="requirement-description"
            value={description}
            aria-label="Describe your requirement"
            aria-invalid={descriptionError}
            placeholder="Describe your requirement*"
            onChange={(event) => {
              setDescription(event.target.value);
              if (event.target.value.trim()) setDescriptionError(false);
            }}
            className={`min-h-11 w-full rounded-xl border bg-white px-3.5 text-sm font-medium text-slate-900 shadow-sm outline-none placeholder:font-normal placeholder:text-slate-400 focus:ring-2 ${
              descriptionError
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "border-slate-200/90 focus:border-sky-500 focus:ring-sky-500/20"
            }`}
          />
          {descriptionError ? (
            <p className="mt-1 text-xs text-red-600">Describe your requirement</p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-10 w-full cursor-pointer items-center justify-center rounded-lg bg-linear-to-r-navy-blue text-sm font-semibold text-white transition hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Submitting..." : "Submit requirements"}
        </button>
      </form>
    </section>
  );
}
