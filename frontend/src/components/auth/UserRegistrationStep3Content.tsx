"use client";

import { AlertTriangle, ChevronLeft, ChevronRight, ImagePlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import FloatingInput from "./FloatingInput";
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

const MAX_OFFICE_PHOTOS = 10;
const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
const ACCEPTED_PHOTO_EXTENSIONS = ".jpeg,.jpg,.png,.gif";

type OfficePhoto = {
  id: string;
  file: File;
  previewUrl: string;
};

type FormErrors = {
  state?: string;
  city?: string;
  locality?: string;
  contactPersonName?: string;
  agencyCompanyName?: string;
  officePhotos?: string;
};

function KycWarning({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-amber-200/80 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-900">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
      <p>{children}</p>
    </div>
  );
}

function OfficePhotoUpload({
  photos,
  onAdd,
  onRemove,
  error,
}: {
  photos: OfficePhoto[];
  onAdd: (files: FileList) => void;
  onRemove: (id: string) => void;
  error?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const remainingSlots = MAX_OFFICE_PHOTOS - photos.length;
  const slots = Array.from({ length: MAX_OFFICE_PHOTOS }, (_, index) => photos[index] ?? null);

  const scrollCarousel = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }
    const offset = direction === "left" ? -220 : 220;
    container.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-slate-700">
        Office Photos (Upload upto 10) (jpeg, jpg, png, gif format)
      </p>

      <div className="relative rounded-xl bg-slate-100/80 px-2 py-4">
        {photos.length < MAX_OFFICE_PHOTOS && (
          <button
            type="button"
            onClick={() => scrollCarousel("left")}
            className="absolute top-1/2 left-1 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:text-slate-700"
            aria-label="Scroll photos left"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scroll-smooth px-8 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
        >
          {slots.map((photo, index) => (
            <div key={photo?.id ?? `empty-${index}`} className="w-28 shrink-0">
              {photo ? (
                <div className="relative">
                  <div className="flex h-24 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.previewUrl}
                      alt={`Office photo ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(photo.id)}
                    className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-white shadow-sm transition hover:bg-slate-700"
                    aria-label={`Remove office photo ${index + 1}`}
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={remainingSlots === 0}
                  className="flex h-24 w-full flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white text-slate-400 transition hover:border-sky-400 hover:text-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ImagePlus className="h-7 w-7" aria-hidden />
                </button>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={remainingSlots === 0 && !photo}
                className="mt-2 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-600 transition hover:border-sky-300 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add Photo
              </button>
            </div>
          ))}
        </div>

        {photos.length < MAX_OFFICE_PHOTOS && (
          <button
            type="button"
            onClick={() => scrollCarousel("right")}
            className="absolute top-1/2 right-1 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:text-slate-700"
            aria-label="Scroll photos right"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_PHOTO_EXTENSIONS}
        multiple
        className="hidden"
        onChange={(event) => {
          if (event.target.files?.length) {
            onAdd(event.target.files);
            event.target.value = "";
          }
        }}
      />

      {error && (
        <p className="mt-1.5 text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default function UserRegistrationStep3Content() {
  const router = useRouter();
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
      ...validFiles.map((file) => ({
        id: `photo-${Date.now()}-${file.name}`,
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
  };

  const handleRemovePhoto = (id: string) => {
    setOfficePhotos((current) => {
      const photo = current.find((item) => item.id === id);
      if (photo) {
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
      officePhotos.forEach((photo) => formData.append("officePhotos", photo.file));

      await saveOfficeDetails(formData, token);
      showToast("Office details saved successfully.");
      router.push("/onboarding");
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
                options={stateOptions}
                value={state}
                onChange={handleStateChange}
                error={errors.state}
              />

              <FloatingInput
                id="city"
                label="City"
                variant="underline"
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
              value={address}
              onChange={setAddress}
            />

            <FloatingInput
              id="postalCode"
              label="Postal Code"
              variant="underline"
              value={postalCode}
              onChange={setPostalCode}
            />

            <div className="space-y-3">
              <FloatingInput
                id="contactPersonName"
                label="Contact Person Name"
                variant="underline"
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

            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
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
