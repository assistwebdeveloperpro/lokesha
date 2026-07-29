"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FloatingInput from "./FloatingInput";
import IconTileSelect from "./IconTileSelect";
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
import { getBusinessDetails, saveBusinessDetails } from "@/services/userBusiness.service";

export default function EditCompanyDetailsContent() {
  const router = useRouter();
  const { showToast } = useToast();
  const { token, isLoggedIn } = useAuth();

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

  useEffect(() => {
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

        setDealingIn(businessDetails.dealing_in as (typeof dealingInOptions)[number]["id"][]);
        setPropertyType(
          businessDetails.property_type as (typeof propertyTypeOptions)[number]["id"][],
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

        setOperatingSince(String(businessDetails.operating_since));
        setExpertiseIn(businessDetails.expertise_in);
        setBusinessDescription(businessDetails.business_description);
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
          businessDetails.clients.length > 0
            ? businessDetails.clients.map((client) => ({
                id: client.id,
                name: client.name ?? "",
                dealValue: client.deal_value ?? "",
              }))
            : [{ id: "client-1", name: "", dealValue: "" }],
        );
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof ApiError ? err.message : "Failed to load company details.",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadBusinessDetails();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, token]);

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
      router.push("/user/profile/account-details");
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
      <div className="mb-5">
        <h1
          id="edit-company-details-heading"
          className="font-display text-xl font-bold text-slate-900 sm:text-2xl"
        >
          Edit Company Details
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Update your business and company information.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
        {isLoading ? (
          <p className="py-8 text-center text-sm text-slate-500">Loading company details…</p>
        ) : (
          <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
              {loadError && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
                  {loadError}
                </p>
              )}

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

              <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
                <FloatingInput
                  id="operatingSince"
                  label="Operating Since"
                  variant="underline"
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

              <fieldset>
                <legend className="mb-3 text-sm font-semibold text-slate-700">
                  Valuable clients:
                </legend>
                <div className="space-y-4">
                  {clients.map((client) => (
                    <div key={client.id} className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                      <FloatingInput
                        id={`client-name-${client.id}`}
                        label="Name"
                        variant="underline"
                        value={client.name}
                        onChange={(value) => updateClient(client.id, "name", value)}
                      />
                      <FloatingInput
                        id={`client-deal-${client.id}`}
                        label="Deal Values"
                        variant="underline"
                        value={client.dealValue}
                        onChange={(value) => updateClient(client.id, "dealValue", value)}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={addClientRow}
                    className="text-sm font-semibold text-sky-700 transition-colors hover:text-sky-600"
                  >
                    + Add More
                  </button>
                </div>
              </fieldset>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-linear-to-r-navy-blue w-full cursor-pointer rounded-xl py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-slate-900/25 transition hover:shadow-slate-900/35 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Saving..." : "Save & Exit"}
              </button>
          </form>
        )}
      </div>
    </section>
  );
}
