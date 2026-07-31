"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import FloatingInput from "@/components/shared/FloatingInput";
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
  dealingInOptions,
  expertiseOptions,
  operatingSinceYears,
  propertyTypeOptions,
  residentialPropertyOptions,
  transactionTypeOptions,
} from "@/components/user-profile/businessDetailsForm.shared";
import { useToast } from "@/components/ui/ToastProvider";
import { ApiError } from "@/services/apiClient";
import { getToken } from "@/services/session";
import { saveBusinessDetails } from "@/services/userCompany.service";

export default function UserRegistrationStep2Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const { showToast } = useToast();

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

    const token = getToken();
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
      showToast("Business details submitted successfully.");
      router.push(
        redirectTo === "edit-company-details"
          ? "/user/profile/edit-company-details"
          : "/user-registration-step-3",
      );
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
    <div className="relative mx-auto my-4 flex min-h-0 w-full max-w-3xl flex-col px-4 py-2 sm:my-4 sm:px-6 sm:py-3 max-h-[calc(100dvh-13rem)] sm:max-h-[calc(100dvh-14rem)] lg:my-6 lg:max-h-[calc(100dvh-9.5rem)] lg:px-8 lg:py-4 xl:px-10">
      <div className="flex min-h-0 max-h-full w-full flex-1 flex-col overflow-hidden rounded-2xl border border-white/80 bg-white/95 shadow-xl shadow-slate-900/5 backdrop-blur-sm">
        <div className="shrink-0 px-4 pt-4 pb-6 sm:px-5 sm:pt-5 lg:px-6 lg:pt-6 ">
            <h1 className="font-display text-2xl font-bold text-slate-800">Agent Registration</h1>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 sm:px-5 sm:pb-5 lg:px-6 lg:pb-6">
          <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
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
              prominentLabel
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
              prominentLabel
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
            prominentLabel
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
            prominentLabel
            value={authorizedAgents}
            onChange={setAuthorizedAgents}
          />

          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
            <YesNoRadioGroup
              legend="Property Registry"
              name="propertyRegistry"
              value={propertyRegistry}
              onChange={(value) => {
                setPropertyRegistry(value)
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
                <div
                  key={client.id}
                  className="grid gap-4 sm:grid-cols-2 sm:gap-5"
                >
                  <FloatingInput
                    id={`client-name-${client.id}`}
                    label="Name"
                    variant="underline"
                    prominentLabel
                    value={client.name}
                    onChange={(value) => updateClient(client.id, "name", value)}
                  />
                  <FloatingInput
                    id={`client-deal-${client.id}`}
                    label="Deal Values"
                    variant="underline"
                    prominentLabel
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
            {isSubmitting ? "Submitting..." : "Submit & Continue"}
          </button>
          </form>
        </div>
      </div>
    </div>
  );
}
