"use client";

import Link from "next/link";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import FloatingInput from "@/components/shared/FloatingInput";
import {
  ACCEPTED_PHOTO_TYPES,
  KycWarning,
  MAX_OFFICE_PHOTOS,
  OfficePhotoUpload,
  createOfficePhotoFromFile,
  createOfficePhotoFromStoredPath,
  type FormErrors,
  type OfficePhoto,
} from "./officeDetailsForm.shared";
import {
  getCityOptions,
  getStateOptions,
  type IndianState,
} from "@/data/indianStatesCities";
import { useToast } from "@/components/ui/ToastProvider";
import { useAuth } from "@/hooks/useAuth";
import { ApiError, getAssetUrl } from "@/services/apiClient";
import { getOfficeDetails, saveOfficeDetails } from "@/services/userOffice.service";

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
    <section className="border-b border-slate-100 px-4 py-5 last:border-b-0 sm:rounded-xl sm:border sm:border-slate-100 sm:bg-linear-to-b sm:from-slate-50/80 sm:to-white sm:p-5 sm:last:border-b">
      <div className="mb-4 flex items-start gap-3 sm:border-b sm:border-slate-200/70 sm:pb-3.5">
        <span
          className="mt-0.5 h-5 w-1 shrink-0 rounded-full bg-sky-500"
          aria-hidden
        />
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight text-slate-800 sm:text-md">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{description}</p>
          ) : null}
        </div>
      </div>
      <div className="space-y-4 sm:space-y-6">{children}</div>
    </section>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-0 animate-pulse overflow-hidden -mx-4 sm:mx-0 sm:space-y-4 sm:rounded-xl sm:border sm:border-slate-100" aria-hidden>
      {[1, 2].map((section) => (
        <div
          key={section}
          className="border-b border-slate-100 px-4 py-5 last:border-b-0 sm:rounded-xl sm:border sm:border-slate-100 sm:bg-slate-50/50 sm:p-5"
        >
          <div className="mb-4 flex items-center gap-3 sm:border-b sm:border-slate-200/70 sm:pb-3.5">
            <div className="h-4 w-1 rounded-full bg-slate-200" />
            <div className="h-4 w-36 rounded bg-slate-200" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-2.5">
            <div className="aspect-square rounded-xl bg-slate-200/80 sm:aspect-auto sm:h-25 sm:min-h-25" />
            <div className="aspect-square rounded-xl bg-slate-200/80 sm:aspect-auto sm:h-25 sm:min-h-25" />
            <div className="hidden aspect-square rounded-xl bg-slate-200/80 sm:block sm:aspect-auto sm:h-25 sm:min-h-25" />
          </div>
        </div>
      ))}
    </div>
  );
}

function OfficeDetailsRequiredNotice() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-sky-100 bg-sky-50/60 px-6 py-10 text-center sm:py-12">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-600">
        <ClipboardList className="h-6 w-6" aria-hidden />
      </span>
      <div className="max-w-sm">
        <h2 className="text-xl font-semibold text-slate-800">Office details not added yet</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
          You haven't filled in your office details yet. Please complete this step first so
          we can show your office profile here.
        </p>
      </div>
      <Link
        href="/user-registration-step-3?redirect=edit-office-details"
        className="inline-flex w-full items-center justify-center rounded-xl bg-linear-to-r-navy-blue px-5 py-3 text-sm font-semibold text-white shadow-md shadow-slate-900/15 transition hover:shadow-slate-900/25 active:scale-[0.99] sm:w-auto sm:py-2.5"
      >
        Fill Office Details
      </Link>
    </div>
  );
}

export default function EditOfficeDetailsContent() {
  const router = useRouter();
  const { showToast } = useToast();
  const { token, isLoggedIn } = useAuth();

  const [state, setState] = useState<IndianState | "">("");
  const [city, setCity] = useState("");
  const [locality, setLocality] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [contactPersonName, setContactPersonName] = useState("");
  const [hidePersonName, setHidePersonName] = useState(false);
  const [agencyCompanyName, setAgencyCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [officePhotos, setOfficePhotos] = useState<OfficePhoto[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [needsOfficeDetails, setNeedsOfficeDetails] = useState(false);

  const stateOptions = useMemo(() => getStateOptions(), []);
  const cityOptions = useMemo(
    () => (state ? getCityOptions(state) : []),
    [state],
  );

  useEffect(() => {
    if (!isLoggedIn || !token) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);

    async function loadOfficeDetails() {
      try {
        const { officeDetails } = await getOfficeDetails(token!);
        if (cancelled) return;

        const hasCoreOfficeDetails =
          Boolean(officeDetails.state?.trim()) ||
          Boolean(officeDetails.city?.trim()) ||
          Boolean(officeDetails.locality?.trim()) ||
          Boolean(officeDetails.contact_person_name?.trim()) ||
          Boolean(officeDetails.agency_company_name?.trim());

        if (!hasCoreOfficeDetails) {
          setNeedsOfficeDetails(true);
          setIsLoading(false);
          return;
        }

        setState(officeDetails.state as IndianState);
        setCity(officeDetails.city);
        setLocality(officeDetails.locality);
        setAddress(officeDetails.address ?? "");
        setPostalCode(officeDetails.postal_code ?? "");
        setContactPersonName(officeDetails.contact_person_name);
        setHidePersonName(officeDetails.hide_person_name);
        setAgencyCompanyName(officeDetails.agency_company_name);
        setCompanyWebsite(officeDetails.company_website ?? "");
        setOfficePhotos(
          (officeDetails.office_photos ?? []).map((storedPath) =>
            createOfficePhotoFromStoredPath(storedPath, getAssetUrl(storedPath)),
          ),
        );
        setIsLoading(false);
      } catch (err) {
        if (cancelled) return;

        if (err instanceof ApiError && err.status === 404) {
          setNeedsOfficeDetails(true);
          setIsLoading(false);
          return;
        }

        setLoadError(err instanceof ApiError ? err.message : "Failed to load office details.");
        setIsLoading(false);
      }
    }

    void loadOfficeDetails();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, token]);

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

  const handleStateChange = (nextState: string) => {
    setState(nextState as IndianState);
    setCity("");
    clearError("state");
    clearError("city");
  };

  const handleAddPhotos = (files: FileList) => {
    const nextErrors: FormErrors = {};
    const validFiles: File[] = [];

    Array.from(files).forEach((file) => {
      if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
        nextErrors.officePhotos = "Only jpeg, jpg, png, and gif formats are allowed.";
        return;
      }
      validFiles.push(file);
    });

    if (nextErrors.officePhotos) {
      setErrors((current) => ({ ...current, officePhotos: nextErrors.officePhotos }));
      return;
    }

    const availableSlots = MAX_OFFICE_PHOTOS - officePhotos.length;
    if (validFiles.length > availableSlots) {
      setErrors((current) => ({
        ...current,
        officePhotos: `You can upload up to ${MAX_OFFICE_PHOTOS} photos.`,
      }));
      return;
    }

    clearError("officePhotos");
    setOfficePhotos((current) => [
      ...current,
      ...validFiles.map((file) => createOfficePhotoFromFile(file)),
    ]);
  };

  const handleRemovePhoto = (id: string) => {
    setOfficePhotos((current) => {
      const photo = current.find((item) => item.id === id);
      if (photo?.file) {
        URL.revokeObjectURL(photo.previewUrl);
      }
      return current.filter((item) => item.id !== id);
    });
    clearError("officePhotos");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const nextErrors: FormErrors = {};

    if (!state) {
      nextErrors.state = "State is required.";
    }
    if (!city) {
      nextErrors.city = "City is required.";
    }
    if (!locality.trim()) {
      nextErrors.locality = "Locality is required.";
    }
    if (!contactPersonName.trim()) {
      nextErrors.contactPersonName = "Contact person name is required.";
    }
    if (!agencyCompanyName.trim()) {
      nextErrors.agencyCompanyName = "Agency/Company name is required.";
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
      const formData = new FormData();
      formData.append("state", state);
      formData.append("city", city);
      formData.append("locality", locality.trim());
      formData.append("address", address.trim());
      formData.append("postalCode", postalCode.trim());
      formData.append("contactPersonName", contactPersonName.trim());
      formData.append("hidePersonName", String(hidePersonName));
      formData.append("agencyCompanyName", agencyCompanyName.trim());
      formData.append("companyWebsite", companyWebsite.trim());
      officePhotos.forEach((photo) => {
        if (photo.file) {
          formData.append("officePhotos", photo.file);
        } else if (photo.storedPath) {
          formData.append("officePhotos", photo.storedPath);
        }
      });

      await saveOfficeDetails(formData, token);
      showToast("Office details updated successfully.");
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
    <section aria-labelledby="edit-office-details-heading" className="w-full max-w-3xl">
      <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-600">
            Office profile
          </p>
          <h1
            id="edit-office-details-heading"
            className="mt-1 font-display text-xl font-bold text-slate-900 sm:text-2xl"
          >
            Edit Office Details
          </h1>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-500">
            Keep your office information accurate so buyers and partners can find and reach you.
          </p>
        </div>
        <Link
          href="/user/profile/account-details"
          className="inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 sm:w-auto sm:justify-start sm:py-2"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to profile
        </Link>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : needsOfficeDetails ? (
        <OfficeDetailsRequiredNotice />
      ) : (
        <div className="overflow-hidden -mx-4 sm:mx-0 sm:rounded-xl sm:border sm:border-slate-200 sm:bg-white sm:shadow-sm">
          <form onSubmit={handleSubmit}>
            {loadError && (
              <p
                className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 sm:mx-5 sm:mt-5"
                role="alert"
              >
                {loadError}
              </p>
            )}

            <FormSection
              title="Office location"
              description="Where your office is based and how buyers can reach you."
            >
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
              <FloatingInput
                id="state"
                label="State"
                variant="underline"
                staticLabel
                options={stateOptions}
                value={state}
                onChange={handleStateChange}
                error={errors.state}
              />

              <FloatingInput
                id="city"
                label="City"
                variant="underline"
                staticLabel
                options={cityOptions}
                value={city}
                onChange={(value) => {
                  setCity(value);
                  clearError("city");
                }}
                error={errors.city}
              />
            </div>

            <FloatingInput
              id="locality"
              label="Locality"
              variant="underline"
              staticLabel
              value={locality}
              onChange={(value) => {
                setLocality(value);
                clearError("locality");
              }}
              error={errors.locality}
            />

            <FloatingInput
              id="address"
              label="Address"
              variant="underline"
              staticLabel
              value={address}
              onChange={setAddress}
            />

            <FloatingInput
              id="postalCode"
              label="Postal Code"
              variant="underline"
              staticLabel
              value={postalCode}
              onChange={setPostalCode}
            />
          </FormSection>

          <FormSection
            title="Contact & company"
            description="Your contact details and agency information."
          >
            <div className="space-y-3">
              <FloatingInput
                id="contactPersonName"
                label="Contact Person Name"
                variant="underline"
                staticLabel
                value={contactPersonName}
                onChange={(value) => {
                  setContactPersonName(value);
                  clearError("contactPersonName");
                }}
                error={errors.contactPersonName}
              />

              <KycWarning>
                Your Contact Name should be as per your KYC records. No further change is allowed in
                your 'Contact Name' once submitted.
              </KycWarning>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-3 text-sm leading-relaxed text-slate-600 sm:items-center sm:gap-2.5 sm:rounded-none sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
              <input
                type="checkbox"
                checked={hidePersonName}
                onChange={(event) => setHidePersonName(event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-sky-600 focus:ring-sky-500 sm:mt-0"
              />
              Hide Person Name
            </label>

            <div className="space-y-3">
              <FloatingInput
                id="agencyCompanyName"
                label="Agency/Company Name"
                variant="underline"
                staticLabel
                value={agencyCompanyName}
                onChange={(value) => {
                  setAgencyCompanyName(value);
                  clearError("agencyCompanyName");
                }}
                error={errors.agencyCompanyName}
              />

              <KycWarning>
                Agency Name/Company Name should be as per your KYC records. No further change is
                allowed in your 'Agency Name/Company Name' once submitted.
              </KycWarning>
            </div>

            <FloatingInput
              id="companyWebsite"
              label="Company Web Site"
              variant="underline"
              staticLabel
              value={companyWebsite}
              onChange={setCompanyWebsite}
            />
          </FormSection>

          <FormSection
            title="Office photos"
            description="Upload photos of your office to build trust with buyers."
          >
            <OfficePhotoUpload
              photos={officePhotos}
              onAdd={handleAddPhotos}
              onRemove={handleRemovePhoto}
              error={errors.officePhotos}
            />
          </FormSection>

            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:bg-transparent sm:px-5 sm:py-5">
              <Link
                href="/user/profile/account-details"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 sm:order-1"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-linear-to-r-navy-blue order-first w-full cursor-pointer rounded-xl px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-slate-900/20 transition hover:shadow-slate-900/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:order-2 sm:w-auto sm:min-w-48"
              >
                {isSubmitting ? "Saving..." : "Save & Exit"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}