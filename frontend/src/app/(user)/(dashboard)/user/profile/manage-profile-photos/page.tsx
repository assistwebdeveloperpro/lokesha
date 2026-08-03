"use client";

import Link from "next/link";
import { ArrowLeft, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/ToastProvider";
import { ApiError, getAssetUrl } from "@/services/apiClient";
import { getProfileDetails } from "@/services/userProfile.service";
import { uploadCompanyLogo } from "@/services/userCompany.service";
import { uploadContactPersonPhoto } from "@/services/userOffice.service";

const uploadButtonClass =
  "inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-800 transition hover:border-sky-300 hover:bg-sky-100 disabled:pointer-events-none disabled:opacity-60 sm:w-auto sm:justify-start sm:rounded-lg sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:font-semibold sm:text-sky-700 sm:underline sm:decoration-sky-700/30 sm:underline-offset-2 sm:hover:bg-transparent sm:hover:text-sky-600 sm:hover:decoration-sky-600";

const COMPANY_LOGO_PLACEHOLDER = "/no-photo-available.png";
const CONTACT_PERSON_PLACEHOLDER = "/no-photo-available.png";

const MAX_PHOTO_SIZE_BYTES = 1 * 1024 * 1024;
const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/bmp"];

function ProfilePhotoImage({
  src,
  alt,
  objectFit = "cover",
}: {
  src: string;
  alt: string;
  objectFit?: "cover" | "contain";
}) {
  return (
    <div className="mx-auto h-32 w-32 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:mx-0 sm:h-25 sm:w-25 sm:rounded sm:shadow-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={`h-full w-full ${objectFit === "contain" ? "object-contain" : "object-cover"}`}
      />
    </div>
  );
}

function PhotoSection({
  placeholder,
  primaryLabel,
  primaryValue,
  statusLabel,
  isUploaded,
  uploadLabel,
  isUploading,
  error,
  onSelectFile,
}: {
  placeholder: React.ReactNode;
  primaryLabel: string;
  primaryValue: string;
  statusLabel: string;
  isUploaded: boolean;
  uploadLabel: string;
  isUploading: boolean;
  error: string | null;
  onSelectFile: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="px-4 py-5 sm:px-5 sm:py-6">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-5">
        {placeholder}

        <div className="w-full min-w-0 flex-1 space-y-3 text-sm sm:space-y-2">
          <div className="text-center sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 sm:text-sm sm:font-medium sm:normal-case sm:tracking-normal sm:text-slate-900">
              {primaryLabel}
              <span className="hidden sm:inline">: </span>
            </p>
            <p className="mt-0.5 wrap-break-word font-semibold text-slate-700 sm:font-semibold sm:text-slate-500">
              {primaryValue}
            </p>
          </div>

          <div className="text-center sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 sm:text-sm sm:font-medium sm:normal-case sm:tracking-normal sm:text-black">
              {statusLabel}
              <span className="hidden sm:inline">:</span>
            </p>
            <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              {isUploaded ? (
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                  Uploaded
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 ring-1 ring-red-200">
                  Not uploaded
                </span>
              )}
              <span className="text-xs text-slate-500">Max size 1 MB</span>
            </div>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_PHOTO_TYPES.join(",")}
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) {
                onSelectFile(file);
              }
            }}
          />

          <div className="pt-1 sm:pt-0">
            <button
              type="button"
              className={uploadButtonClass}
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 shrink-0 sm:hidden" aria-hidden />
              {isUploading ? "Uploading…" : uploadLabel}
            </button>
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-600 sm:text-left">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ManageProfilePhotosPage() {
  const { token, isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const [companyName, setCompanyName] = useState("");
  const [contactPersonName, setContactPersonName] = useState("");
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [contactPersonPhoto, setContactPersonPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn || !token) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadProfile() {
      try {
        const { profile } = await getProfileDetails(token!);
        if (!cancelled) {
          setCompanyName(profile.company_name ?? "—");
          setContactPersonName(profile.name ?? "—");
          setCompanyLogo(profile.company_logo ?? null);
          setContactPersonPhoto(profile.contact_person_photo ?? null);
        }
      } catch {
        if (!cancelled) {
          setCompanyName("—");
          setContactPersonName("—");
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

  const validateFile = (file: File) => {
    if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
      return "Only .jpg, .gif, .png, .bmp formats are allowed.";
    }
    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      return "File size must not exceed 1 MB.";
    }
    return null;
  };

  const handleCompanyLogoSelect = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setLogoError(validationError);
      return;
    }
    setLogoError(null);

    if (!token) {
      showToast("Please login to continue.", "error");
      return;
    }

    setIsUploadingLogo(true);
    try {
      const { businessDetails } = await uploadCompanyLogo(file, token);
      setCompanyLogo((businessDetails.company_logo as string) ?? null);
      showToast("Company logo uploaded successfully.");
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Something went wrong. Please try again.";
      setLogoError(message);
      showToast(message, "error");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleContactPersonPhotoSelect = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setPhotoError(validationError);
      return;
    }
    setPhotoError(null);

    if (!token) {
      showToast("Please login to continue.", "error");
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const { officeDetails } = await uploadContactPersonPhoto(file, token);
      setContactPersonPhoto((officeDetails.contact_person_photo as string) ?? null);
      showToast("Contact person's photo uploaded successfully.");
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Something went wrong. Please try again.";
      setPhotoError(message);
      showToast(message, "error");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const displayCompanyName = isLoading ? "Loading…" : companyName;
  const displayContactName = isLoading ? "Loading…" : contactPersonName;

  return (
    <section aria-labelledby="manage-profile-photos-heading" className="max-w-3xl">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <h1
            id="manage-profile-photos-heading"
            className="font-display text-xl font-bold text-slate-900 sm:text-2xl"
          >
            Manage Profile Photos
          </h1>
          <p className="profile-description mt-1.5 max-w-2xl">
            Upload your company logo and contact photo in .jpg, .gif, .png, or .bmp format. Each
            file must be 1 MB or smaller.
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
        <PhotoSection
          placeholder={
            <ProfilePhotoImage
              src={companyLogo ? getAssetUrl(companyLogo) : COMPANY_LOGO_PLACEHOLDER}
              alt="Company logo"
              objectFit="contain"
            />
          }
          primaryLabel="Company Name"
          primaryValue={displayCompanyName}
          statusLabel="Company Logo Status"
          isUploaded={Boolean(companyLogo)}
          uploadLabel={companyLogo ? "Change Company Logo" : "Upload Company Logo"}
          isUploading={isUploadingLogo}
          error={logoError}
          onSelectFile={handleCompanyLogoSelect}
        />

        <div className="border-t border-slate-200" aria-hidden />

        <PhotoSection
          placeholder={
            <ProfilePhotoImage
              src={contactPersonPhoto ? getAssetUrl(contactPersonPhoto) : CONTACT_PERSON_PLACEHOLDER}
              alt="Contact person photo"
            />
          }
          primaryLabel="Contact Person"
          primaryValue={displayContactName}
          statusLabel="Contact Person's Photo Status"
          isUploaded={Boolean(contactPersonPhoto)}
          uploadLabel={contactPersonPhoto ? "Change your photo" : "Upload your photo"}
          isUploading={isUploadingPhoto}
          error={photoError}
          onSelectFile={handleContactPersonPhotoSelect}
        />
      </div>
    </section>
  );
}
