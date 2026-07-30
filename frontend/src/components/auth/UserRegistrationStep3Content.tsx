"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import FloatingInput from "@/components/shared/FloatingInput";
import {
  ACCEPTED_PHOTO_TYPES,
  KycWarning,
  MAX_OFFICE_PHOTOS,
  OfficePhotoUpload,
  createOfficePhotoFromFile,
  type FormErrors,
  type OfficePhoto,
} from "@/components/user-profile/officeDetailsForm.shared";
import {
  DEFAULT_STATE,
  getCityOptions,
  getDefaultCityForState,
  getStateOptions,
  type IndianState,
} from "@/data/indianStatesCities";
import { useToast } from "@/components/ui/ToastProvider";
import { ApiError } from "@/services/apiClient";
import { getToken } from "@/services/session";
import { saveOfficeDetails } from "@/services/userOffice.service";

export default function UserRegistrationStep3Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const { showToast } = useToast();

  const [state, setState] = useState<IndianState>(DEFAULT_STATE);
  const [city, setCity] = useState(getDefaultCityForState(DEFAULT_STATE));
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

  const stateOptions = useMemo(() => getStateOptions(), []);
  const cityOptions = useMemo(() => getCityOptions(state), [state]);

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
    const selectedState = nextState as IndianState;
    setState(selectedState);
    setCity(getDefaultCityForState(selectedState));
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

    const token = getToken();
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
      showToast("Office details saved successfully.");
      router.push(
        redirectTo === "edit-office-details" ? "/user/profile/edit-office-details" : "/onboarding",
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
        <div className="shrink-0 px-4 pt-4 pb-6 sm:px-5 sm:pt-5 lg:px-6 lg:pt-6">
          <h1 className="font-display text-2xl font-bold text-slate-800">Agent Registration</h1>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 sm:px-5 sm:pb-5 lg:px-6 lg:pb-6">
          <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
              <FloatingInput
                id="state"
                label="State"
                variant="underline"
                prominentLabel
                blackText
                options={stateOptions}
                value={state}
                onChange={handleStateChange}
                error={errors.state}
              />

              <FloatingInput
                id="city"
                label="City"
                variant="underline"
                prominentLabel
                blackText
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
              prominentLabel
              blackText
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
              prominentLabel
              blackText
              value={address}
              onChange={setAddress}
            />

            <FloatingInput
              id="postalCode"
              label="Postal Code"
              variant="underline"
              prominentLabel
              blackText
              value={postalCode}
              onChange={setPostalCode}
            />

            <div className="space-y-3">
              <FloatingInput
                id="contactPersonName"
                label="Contact Person Name"
                variant="underline"
                prominentLabel
                blackText
                value={contactPersonName}
                onChange={(value) => {
                  setContactPersonName(value);
                  clearError("contactPersonName");
                }}
                error={errors.contactPersonName}
              />

              <KycWarning>
                Your Contact Name should be as per your KYC records. No further change is allowed
                in your 'Contact Name' once submitted.
              </KycWarning>
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-black">
              <input
                type="checkbox"
                checked={hidePersonName}
                onChange={(event) => setHidePersonName(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              Hide Person Name
            </label>

            <div className="space-y-3">
              <FloatingInput
                id="agencyCompanyName"
                label="Agency/Company Name"
                variant="underline"
                prominentLabel
                blackText
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

            <OfficePhotoUpload
              photos={officePhotos}
              onAdd={handleAddPhotos}
              onRemove={handleRemovePhoto}
              error={errors.officePhotos}
            />

            <FloatingInput
              id="companyWebsite"
              label="Company Web Site"
              variant="underline"
              prominentLabel
              blackText
              value={companyWebsite}
              onChange={setCompanyWebsite}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-linear-to-r-navy-blue w-full cursor-pointer rounded-xl py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-slate-900/25 transition hover:shadow-slate-900/35 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Done"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
