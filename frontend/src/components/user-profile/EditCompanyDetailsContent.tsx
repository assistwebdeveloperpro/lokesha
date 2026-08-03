"use client";

import Link from "next/link";
import { ArrowLeft, ClipboardList, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FloatingInput from "@/components/shared/FloatingInput";
import IconTileSelect from "@/components/auth/IconTileSelect";
import {
  BUSINESS_DESCRIPTION_MIN_LENGTH,
  BUSINESS_DESCRIPTION_MIN_LENGTH_ERROR,
  BUSINESS_DESCRIPTION_REQUIRED_ERROR,
  COMMERCIAL_PROPERTY_FIELD_ERROR,
  DEALING_IN_FIELD_ERROR,
  EXPERTISE_IN_FIELD_ERROR,
  FloatingTextarea,
  type FormErrors,
  OPERATING_SINCE_FIELD_ERROR,
  PROPERTY_TYPE_FIELD_ERROR,
  RESIDENTIAL_PROPERTY_FIELD_ERROR,
  TRANSACTION_TYPE_FIELD_ERROR,
  YesNoRadioGroup,
  type ClientRow,
  commercialPropertyOptions,
  commercialPropertyOthersOptions,
  dealingInOptions,
  expertiseOptions,
  operatingSinceYears,
  propertyTypeOptions,
  residentialPropertyOptions,
  residentialPropertyOthersOptions,
  splitMergedSelections,
  transactionTypeOptions,
  transactionTypeOthersOptions,
} from "./businessDetailsForm.shared";
import { useToast } from "@/components/ui/ToastProvider";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/services/apiClient";
import { getBusinessDetails, saveBusinessDetails } from "@/services/userCompany.service";

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-100 bg-linear-to-b from-slate-50/80 to-white p-4 sm:p-5">
      <div className="mb-4 flex items-start gap-3 border-b border-slate-200/70 pb-3.5">
        <span
          className="mt-0.5 h-5 w-1 shrink-0 rounded-full bg-sky-500"
          aria-hidden
        />
        <div>
          <h2 className="text-md font-semibold tracking-tight text-slate-800">{title}</h2>
          {description ? (
            <p className="profile-description mt-0.5">{description}</p>
          ) : null}
        </div>
      </div>
      <div className="space-y-5 sm:space-y-6">{children}</div>
    </section>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse" aria-hidden>
      {[1, 2, 3].map((section) => (
        <div
          key={section}
          className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 sm:p-5"
        >
          <div className="mb-4 flex items-center gap-3 border-b border-slate-200/70 pb-3.5">
            <div className="h-4 w-1 rounded-full bg-slate-200" />
            <div className="h-4 w-36 rounded bg-slate-200" />
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            <div className="h-23 rounded-xl bg-slate-200/80 sm:min-h-25" />
            <div className="h-23 rounded-xl bg-slate-200/80 sm:min-h-25" />
            <div className="hidden h-23 rounded-xl bg-slate-200/80 sm:block sm:min-h-25" />
          </div>
        </div>
      ))}
    </div>
  );
}

function BusinessProfileRequiredNotice() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-sky-100 bg-sky-50/60 px-6 py-10 text-center sm:py-12">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-600">
        <ClipboardList className="h-6 w-6" aria-hidden />
      </span>
      <div className="max-w-sm">
        <h2 className="text-xl font-semibold text-slate-800">
          Business details not added yet
        </h2>
        <p className="profile-description mt-1.5">
          You haven't filled in your business details yet. Please complete this step first
          so we can show your company profile here.
        </p>
      </div>
      <Link
        href="/user-registration-step-2?redirect=edit-company-details"
        className="inline-flex items-center justify-center rounded-xl bg-linear-to-r-navy-blue px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-900/15 transition hover:shadow-slate-900/25 active:scale-[0.99]"
      >
        Fill Business Details
      </Link>
    </div>
  );
}

export default function EditCompanyDetailsContent() {
  const router = useRouter();
  const { showToast } = useToast();
  const { token, isLoggedIn, isAuthReady } = useAuth();

  const [dealingIn, setDealingIn] = useState<(typeof dealingInOptions)[number]["id"][]>([]);
  const [propertyType, setPropertyType] =
    useState<(typeof propertyTypeOptions)[number]["id"][]>([]);
  const [transactionType, setTransactionType] =
    useState<(typeof transactionTypeOptions)[number]["id"][]>([]);
  const [transactionTypeOthers, setTransactionTypeOthers] = useState<string[]>([]);
  const [residentialProperty, setResidentialProperty] =
    useState<(typeof residentialPropertyOptions)[number]["id"][]>([]);
  const [residentialPropertyOthers, setResidentialPropertyOthers] = useState<string[]>([]);
  const [commercialProperty, setCommercialProperty] =
    useState<(typeof commercialPropertyOptions)[number]["id"][]>([]);
  const [commercialPropertyOthers, setCommercialPropertyOthers] = useState<string[]>([]);
  const [operatingSince, setOperatingSince] = useState("");
  const [expertiseIn, setExpertiseIn] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [authorizedAgents, setAuthorizedAgents] = useState("");
  const [propertyRegistry, setPropertyRegistry] = useState<"yes" | "no" | "">("");
  const [loanFacility, setLoanFacility] = useState<"yes" | "no" | "">("");
  const [clients, setClients] = useState<ClientRow[]>([
    { id: "client-1", name: "", dealValue: "" },
  ]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [needsBusinessDetails, setNeedsBusinessDetails] = useState(false);

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    if (!isLoggedIn || !token) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);

    async function loadBusinessDetails() {
      try {
        const { businessDetails } = await getBusinessDetails(token!);
        if (cancelled) return;

        const hasCoreBusinessDetails =
          (businessDetails.dealing_in?.length ?? 0) > 0 ||
          (businessDetails.property_type?.length ?? 0) > 0 ||
          businessDetails.operating_since != null;

        if (!hasCoreBusinessDetails) {
          setNeedsBusinessDetails(true);
          setIsLoading(false);
          return;
        }

        setDealingIn(
          (businessDetails.dealing_in ?? []) as (typeof dealingInOptions)[number]["id"][],
        );
        setPropertyType(
          (businessDetails.property_type ?? []) as (typeof propertyTypeOptions)[number]["id"][],
        );

        const transactionSplit = splitMergedSelections(
          businessDetails.transaction_type,
          transactionTypeOptions.map((option) => option.id),
          transactionTypeOthersOptions.map((option) => option.id),
        );
        setTransactionType(transactionSplit.tileSelections);
        setTransactionTypeOthers(transactionSplit.othersSelections);

        const residentialSplit = splitMergedSelections(
          businessDetails.residential_property,
          residentialPropertyOptions.map((option) => option.id),
          residentialPropertyOthersOptions.map((option) => option.id),
        );
        setResidentialProperty(residentialSplit.tileSelections);
        setResidentialPropertyOthers(residentialSplit.othersSelections);

        const commercialSplit = splitMergedSelections(
          businessDetails.commercial_property,
          commercialPropertyOptions.map((option) => option.id),
          commercialPropertyOthersOptions.map((option) => option.id),
        );
        setCommercialProperty(commercialSplit.tileSelections);
        setCommercialPropertyOthers(commercialSplit.othersSelections);

        setOperatingSince(
          businessDetails.operating_since != null ? String(businessDetails.operating_since) : "",
        );
        setExpertiseIn(businessDetails.expertise_in ?? "");
        setBusinessDescription(businessDetails.business_description ?? "");
        setAuthorizedAgents(businessDetails.authorized_agents ?? "");
        setPropertyRegistry(
          businessDetails.property_registry === true
            ? "yes"
            : businessDetails.property_registry === false
              ? "no"
              : "",
        );
        setLoanFacility(
          businessDetails.loan_facility === true
            ? "yes"
            : businessDetails.loan_facility === false
              ? "no"
              : "",
        );
        setClients(
          businessDetails.clients?.length > 0
            ? businessDetails.clients.map((client) => ({
                id: client.id,
                name: client.name ?? "",
                dealValue: client.deal_value ?? "",
              }))
            : [{ id: "client-1", name: "", dealValue: "" }],
        );
        setIsLoading(false);
      } catch (err) {
        if (cancelled) return;

        if (err instanceof ApiError && err.status === 404) {
          setNeedsBusinessDetails(true);
          setIsLoading(false);
          return;
        }

        setLoadError(err instanceof ApiError ? err.message : "Failed to load company details.");
        setIsLoading(false);
      }
    }

    void loadBusinessDetails();

    return () => {
      cancelled = true;
    };
  }, [isAuthReady, isLoggedIn, token]);

  const showResidentialProperty =
    !propertyType.includes("commercial") || propertyType.includes("residential");
  const showCommercialProperty = propertyType.includes("commercial");

  const clearError = (field: keyof FormErrors) => {
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const addClientRow = () => {
    setClients((current) => [
      ...current,
      { id: `client-${Date.now()}`, name: "", dealValue: "" },
    ]);
  };

  const updateClient = (id: string, field: "name" | "dealValue", value: string) => {
    setClients((current) =>
      current.map((client) => (client.id === id ? { ...client, [field]: value } : client)),
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const nextErrors: FormErrors = {};

    if (dealingIn.length === 0) {
      nextErrors.dealingIn = DEALING_IN_FIELD_ERROR;
    }
    if (propertyType.length === 0) {
      nextErrors.propertyType = PROPERTY_TYPE_FIELD_ERROR;
    }
    if (transactionType.length === 0) {
      nextErrors.transactionType = TRANSACTION_TYPE_FIELD_ERROR;
    }
    if (showResidentialProperty && residentialProperty.length === 0) {
      nextErrors.residentialProperty = RESIDENTIAL_PROPERTY_FIELD_ERROR;
    }
    if (showCommercialProperty && commercialProperty.length === 0) {
      nextErrors.commercialProperty = COMMERCIAL_PROPERTY_FIELD_ERROR;
    }
    if (!operatingSince) {
      nextErrors.operatingSince = OPERATING_SINCE_FIELD_ERROR;
    }
    if (!expertiseIn) {
      nextErrors.expertiseIn = EXPERTISE_IN_FIELD_ERROR;
    }
    const trimmedBusinessDescription = businessDescription.trim();
    if (!trimmedBusinessDescription) {
      nextErrors.businessDescription = BUSINESS_DESCRIPTION_REQUIRED_ERROR;
    } else if (trimmedBusinessDescription.length < BUSINESS_DESCRIPTION_MIN_LENGTH) {
      nextErrors.businessDescription = BUSINESS_DESCRIPTION_MIN_LENGTH_ERROR;
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
      await saveBusinessDetails(
        {
          dealingIn,
          propertyType,
          transactionType,
          transactionTypeOthers,
          residentialProperty,
          residentialPropertyOthers,
          commercialProperty,
          commercialPropertyOthers,
          operatingSince,
          expertiseIn,
          businessDescription,
          authorizedAgents: authorizedAgents.trim() || undefined,
          propertyRegistry: propertyRegistry || undefined,
          loanFacility: loanFacility || undefined,
          clients: clients
            .filter((client) => client.name.trim() || client.dealValue.trim())
            .map(({ name, dealValue }) => ({ name, dealValue })),
        },
        token,
      );
      showToast("Business details updated successfully.");
    } catch (error) {
      showToast(
        error instanceof ApiError ? error.message : "Something went wrong. Please try again.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section aria-labelledby="edit-company-details-heading" className="max-w-3xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-600">
            Company profile
          </p>
          <h1
            id="edit-company-details-heading"
            className="mt-1 font-display text-xl font-bold text-slate-900 sm:text-2xl"
          >
            Edit Company Details
          </h1>
          <p className="profile-description mt-1.5 max-w-xl">
            Keep your business information accurate so buyers and partners see the right
            details about your company.
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

      {!isAuthReady || isLoading ? (
        <LoadingSkeleton />
      ) : needsBusinessDetails ? (
        <BusinessProfileRequiredNotice />
      ) : (
        <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
          {loadError && (
            <p
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
              role="alert"
            >
              {loadError}
            </p>
          )}

          <FormSection
            title="Business focus"
            description="What you deal in and the types of properties you work with."
          >
            <IconTileSelect
              legend="I am Dealing In"
              name="dealingIn"
              options={[...dealingInOptions]}
              value={dealingIn}
              onChange={(value) => {
                setDealingIn(value);
                clearError("dealingIn");
              }}
              columns={2}
              error={errors.dealingIn}
            />

            <IconTileSelect
              legend="Property Type"
              name="propertyType"
              options={[...propertyTypeOptions]}
              value={propertyType}
              onChange={(value) => {
                setPropertyType(value);
                clearError("propertyType");
                if (value.includes("commercial") && !value.includes("residential")) {
                  clearError("residentialProperty");
                  setResidentialProperty([]);
                  setResidentialPropertyOthers([]);
                }
                if (!value.includes("commercial")) {
                  clearError("commercialProperty");
                  setCommercialProperty([]);
                  setCommercialPropertyOthers([]);
                }
              }}
              columns={2}
              error={errors.propertyType}
            />

            <IconTileSelect
              legend="Transaction Type"
              name="transactionType"
              options={[...transactionTypeOptions]}
              value={transactionType}
              onChange={(value) => {
                setTransactionType(value);
                clearError("transactionType");
              }}
              columns={3}
              dropdownSelections={transactionTypeOthers}
              onDropdownSelectionsChange={setTransactionTypeOthers}
              error={errors.transactionType}
            />
          </FormSection>

          {(showResidentialProperty || showCommercialProperty) && (
            <FormSection
              title="Property categories"
              description="Select the specific property types you handle."
            >
              {showResidentialProperty && (
                <IconTileSelect
                  legend="Types of Residential Property"
                  name="residentialProperty"
                  options={[...residentialPropertyOptions]}
                  value={residentialProperty}
                  onChange={(value) => {
                    setResidentialProperty(value);
                    clearError("residentialProperty");
                  }}
                  columns={5}
                  dropdownSelections={residentialPropertyOthers}
                  onDropdownSelectionsChange={setResidentialPropertyOthers}
                  error={errors.residentialProperty}
                />
              )}

              {showCommercialProperty && (
                <IconTileSelect
                  legend="Types of Commercial Property"
                  name="commercialProperty"
                  options={[...commercialPropertyOptions]}
                  value={commercialProperty}
                  onChange={(value) => {
                    setCommercialProperty(value);
                    clearError("commercialProperty");
                  }}
                  columns={5}
                  dropdownSelections={commercialPropertyOthers}
                  onDropdownSelectionsChange={setCommercialPropertyOthers}
                  error={errors.commercialProperty}
                />
              )}
            </FormSection>
          )}

          <FormSection
            title="Company profile"
            description="Tell us about your experience and what your business offers."
          >
            <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
              <FloatingInput
                id="operatingSince"
                label="Operating Since"
                variant="underline"
                staticLabel
                options={operatingSinceYears}
                value={operatingSince}
                onChange={(value) => {
                  setOperatingSince(value);
                  clearError("operatingSince");
                }}
                error={errors.operatingSince}
              />

              <FloatingInput
                id="expertiseIn"
                label="Expertise In"
                variant="underline"
                staticLabel
                options={expertiseOptions}
                value={expertiseIn}
                onChange={(value) => {
                  setExpertiseIn(value);
                  clearError("expertiseIn");
                }}
                error={errors.expertiseIn}
              />
            </div>

            <FloatingTextarea
              id="businessDescription"
              label="Brief Description of Your Business (Min 100, Max 3000 Characters)"
              value={businessDescription}
              onChange={(value) => {
                setBusinessDescription(value);
                clearError("businessDescription");
              }}
              error={errors.businessDescription}
            />

            <FloatingTextarea
              id="authorizedAgents"
              label="Authorized Agents / Dealers of (Max 3000 Characters)"
              value={authorizedAgents}
              onChange={setAuthorizedAgents}
            />
          </FormSection>

          <FormSection
            title="Services & facilities"
            description="Optional services you can provide to clients."
          >
            <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
              <YesNoRadioGroup
                legend="Property Registry"
                name="propertyRegistry"
                value={propertyRegistry}
                onChange={(value) => {
                  setPropertyRegistry(value);
                }}
              />

              <YesNoRadioGroup
                legend="Can Provide Loan Facility"
                name="loanFacility"
                value={loanFacility}
                onChange={(value) => {
                  setLoanFacility(value);
                }}
              />
            </div>
          </FormSection>

          <FormSection
            title="Valuable clients"
            description="Highlight key clients and deal values to build credibility."
          >
            <div className="space-y-3">
              {clients.map((client, index) => (
                <div
                  key={client.id}
                  className="rounded-lg border border-slate-200/90 bg-white p-4 shadow-sm"
                >
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Client {index + 1}
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                    <FloatingInput
                      id={`client-name-${client.id}`}
                      label="Name"
                      variant="underline"
                      staticLabel
                      value={client.name}
                      onChange={(value) => updateClient(client.id, "name", value)}
                    />
                    <FloatingInput
                      id={`client-deal-${client.id}`}
                      label="Deal Values"
                      variant="underline"
                      staticLabel
                      value={client.dealValue}
                      onChange={(value) => updateClient(client.id, "dealValue", value)}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={addClientRow}
                className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-sky-300 bg-sky-50/60 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:border-sky-400 hover:bg-sky-50"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Add more
              </button>
            </div>
          </FormSection>

          <div className="flex flex-col-reverse gap-3 pt-5 sm:flex-row sm:items-center sm:justify-end">
            <Link
              href="/user/profile/account-details"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-linear-to-r-navy-blue w-full cursor-pointer rounded-xl px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-slate-900/20 transition hover:shadow-slate-900/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-48"
            >
              {isSubmitting ? "Saving..." : "Save & Exit"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
