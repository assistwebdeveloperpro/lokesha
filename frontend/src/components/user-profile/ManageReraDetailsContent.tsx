"use client";

import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import FloatingInput from "@/components/shared/FloatingInput";
import {
  ACCEPTED_RERA_DOCUMENT_EXTENSIONS,
  MONTH_OPTIONS,
  type ReraEntry,
  type ReraFormErrors,
  formatValidity,
  getStateDropdownOptions,
  getYearOptions,
  validateReraForm,
} from "./reraDetailsForm.shared";
import { type IndianState } from "@/data/indianStatesCities";
import { useToast } from "@/components/ui/ToastProvider";
import { useAuth } from "@/hooks/useAuth";
import { ApiError, getAssetUrl } from "@/services/apiClient";
import {
  createReraDetail,
  deleteReraDetail,
  getReraDetails,
  updateReraDetail,
  type ReraDetail,
} from "@/services/userRera.service";

function toReraEntry(detail: ReraDetail): ReraEntry {
  return {
    id: detail.id,
    state: detail.state as IndianState,
    reraId: detail.rera_id,
    validityMonth: detail.validity_month,
    validityYear: detail.validity_year,
    verificationLink: detail.verification_link ?? "",
    documentFileName: detail.document_original_name,
    documentUrl: getAssetUrl(detail.document_path),
  };
}

type FormMode = "add" | "edit";

function FormRow({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 border-b border-slate-100 py-4 last:border-b-0 sm:grid-cols-[minmax(9rem,11rem)_1fr] sm:items-start sm:gap-6">
      <label className="pt-2 text-sm font-semibold text-slate-700">
        {label}
        {required ? <span className="text-red-500">*</span> : null}
      </label>
      <div>{children}</div>
    </div>
  );
}

function DeleteConfirmModal({
  stateName,
  onCancel,
  onConfirm,
  isDeleting,
}: {
  stateName: string;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close delete confirmation"
        className="absolute inset-0 cursor-pointer bg-slate-900/40"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-rera-heading"
        className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onCancel}
          className="absolute right-3 top-3 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
        <h2 id="delete-rera-heading" className="pr-8 text-lg font-semibold text-slate-900">
          Delete RERA Details
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Are you sure you want to delete RERA details for {stateName}? This action cannot be
          undone.
        </p>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-linear-to-r-navy-blue px-4 py-2.5 text-sm font-semibold text-white transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "OK"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReraEntryCard({
  entry,
  onEdit,
  onDelete,
}: {
  entry: ReraEntry;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const documentUrl = entry.documentUrl;

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
        <h3 className="text-base font-semibold text-slate-900">{entry.state}</h3>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-green-300 hover:bg-green-50 hover:text-green-700"
          >
            <Pencil className="h-4 w-4" aria-hidden />
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Delete
          </button>
        </div>
      </div>

      <div className="grid gap-4 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-6 sm:px-5">
        <dl className="min-w-0 space-y-3">
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(9rem,11rem)_minmax(0,1fr)] sm:gap-4">
            <dt className="text-sm text-slate-500">RERA ID</dt>
            <dd className="break-all text-sm font-medium text-slate-900">{entry.reraId}</dd>
          </div>
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(9rem,11rem)_minmax(0,1fr)] sm:gap-4">
            <dt className="text-sm text-slate-500">Validity</dt>
            <dd className="text-sm font-medium text-slate-900">
              {formatValidity(entry.validityMonth, entry.validityYear)}
            </dd>
          </div>
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(9rem,11rem)_minmax(0,1fr)] sm:gap-4">
            <dt className="text-sm text-slate-500">Supporting document</dt>
            <dd className="min-w-0 text-sm font-medium">
              {documentUrl ? (
                <a
                  href={documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-sky-700 underline decoration-sky-700/30 underline-offset-2 transition hover:text-sky-600"
                >
                  {entry.documentFileName}
                </a>
              ) : (
                <span className="break-all text-slate-900">{entry.documentFileName}</span>
              )}
            </dd>
          </div>
        </dl>

        <span className="inline-flex w-fit shrink-0 self-start items-center rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 ring-1 ring-rose-100">
          Verification Pending
        </span>
      </div>
    </article>
  );
}

export default function ManageReraDetailsContent() {
  const { showToast } = useToast();
  const { token, isLoggedIn } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [entries, setEntries] = useState<ReraEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("add");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [state, setState] = useState("");
  const [reraId, setReraId] = useState("");
  const [validityMonth, setValidityMonth] = useState("");
  const [validityYear, setValidityYear] = useState("");
  const [verificationLink, setVerificationLink] = useState("");
  const [supportingDocument, setSupportingDocument] = useState<File | null>(null);
  const [existingDocumentName, setExistingDocumentName] = useState("");
  const [errors, setErrors] = useState<ReraFormErrors>({});

  const stateOptions = useMemo(() => getStateDropdownOptions(), []);
  const yearOptions = useMemo(() => getYearOptions(), []);

  const deleteTarget = entries.find((entry) => entry.id === deleteTargetId);

  useEffect(() => {
    if (!isLoggedIn || !token) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);

    async function loadReraDetails() {
      try {
        const { reraDetails } = await getReraDetails(token!);
        if (cancelled) return;
        setEntries(reraDetails.map(toReraEntry));
        setIsLoading(false);
      } catch (err) {
        if (cancelled) return;
        setLoadError(err instanceof ApiError ? err.message : "Failed to load RERA details.");
        setIsLoading(false);
      }
    }

    void loadReraDetails();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, token]);

  const resetForm = () => {
    setState("");
    setReraId("");
    setValidityMonth("");
    setValidityYear("");
    setVerificationLink("");
    setSupportingDocument(null);
    setExistingDocumentName("");
    setErrors({});
    setEditingId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openAddForm = () => {
    resetForm();
    setFormMode("add");
    setShowForm(true);
  };

  const openEditForm = (entry: ReraEntry) => {
    setFormMode("edit");
    setEditingId(entry.id);
    setState(entry.state);
    setReraId(entry.reraId);
    setValidityMonth(entry.validityMonth);
    setValidityYear(entry.validityYear);
    setVerificationLink(entry.verificationLink);
    setSupportingDocument(null);
    setExistingDocumentName(entry.documentFileName);
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const clearError = (field: keyof ReraFormErrors) => {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleDocumentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSupportingDocument(file);
    if (file) {
      setExistingDocumentName("");
    }
    clearError("supportingDocument");
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    const nextErrors = validateReraForm(
      {
        state,
        reraId,
        validityMonth,
        validityYear,
        verificationLink,
        supportingDocument,
        existingDocumentName,
      },
      entries,
      editingId,
    );

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (!token) {
      showToast("Please login to continue.", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("state", state);
      formData.append("reraId", reraId.trim());
      formData.append("validityMonth", validityMonth);
      formData.append("validityYear", validityYear);
      formData.append("verificationLink", verificationLink.trim());
      if (supportingDocument) {
        formData.append("document", supportingDocument);
      }

      if (formMode === "edit" && editingId) {
        const { reraDetail } = await updateReraDetail(editingId, formData, token);
        setEntries((current) =>
          current.map((entry) => (entry.id === editingId ? toReraEntry(reraDetail) : entry)),
        );
        showToast("RERA details updated successfully.");
      } else {
        const { reraDetail } = await createReraDetail(formData, token);
        setEntries((current) => [...current, toReraEntry(reraDetail)]);
        showToast("RERA details added successfully.");
      }

      setShowForm(false);
      resetForm();
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setErrors((current) => ({ ...current, state: error.message }));
      } else {
        showToast(
          error instanceof ApiError ? error.message : "Something went wrong. Please try again.",
          "error",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId || !token) return;

    setIsDeleting(true);
    try {
      await deleteReraDetail(deleteTargetId, token);
      setEntries((current) => current.filter((entry) => entry.id !== deleteTargetId));
      setDeleteTargetId(null);
      showToast("RERA details deleted successfully.");
    } catch (error) {
      showToast(
        error instanceof ApiError ? error.message : "Something went wrong. Please try again.",
        "error",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (showForm) {
    return (
      <section aria-labelledby="rera-details-heading" className="max-w-4xl">
        <div className="mb-5">
          <h1
            id="rera-details-heading"
            className="font-display text-xl font-bold text-slate-900 sm:text-2xl"
          >
            RERA Details
          </h1>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
            <h2 className="text-base font-semibold text-slate-800">
              {formMode === "add" ? "ADD RERA Details" : "EDIT RERA Details"}
            </h2>
          </div>

          <form onSubmit={handleSave} className="px-4 sm:px-5">
            <FormRow label="State" required>
              <FloatingInput
                id="rera-state"
                ariaLabel="State"
                variant="underline"
                staticLabel
                options={stateOptions}
                value={state}
                dropdownMenuClassName="absolute left-0 z-20 mt-1 max-h-48 w-full min-w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg shadow-slate-900/10 lg:min-w-96"
                onChange={(value) => {
                  setState(value);
                  clearError("state");
                  clearError("reraId");
                }}
                error={errors.state}
              />
            </FormRow>

            <FormRow label="RERA ID" required>
              <FloatingInput
                id="rera-id"
                label="Enter your RERA ID"
                variant="underline"
                staticLabel
                value={reraId}
                onChange={(value) => {
                  setReraId(value);
                  clearError("reraId");
                }}
                error={errors.reraId}
              />
            </FormRow>

            <FormRow label="Validity" required>
              <div className="grid grid-cols-2 gap-4">
                <FloatingInput
                  id="rera-validity-month"
                  ariaLabel="Month"
                  variant="underline"
                  staticLabel
                  options={MONTH_OPTIONS}
                  value={validityMonth}
                  dropdownMenuClassName="absolute left-0 z-20 mt-1 max-h-48 w-full min-w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg shadow-slate-900/10"
                  onChange={(value) => {
                    setValidityMonth(value);
                    clearError("validityMonth");
                    clearError("validityYear");
                  }}
                  error={errors.validityMonth}
                />
                <FloatingInput
                  id="rera-validity-year"
                  ariaLabel="Year"
                  variant="underline"
                  staticLabel
                  options={yearOptions}
                  value={validityYear}
                  dropdownMenuClassName="absolute left-0 z-20 mt-1 max-h-48 w-full min-w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg shadow-slate-900/10"
                  onChange={(value) => {
                    setValidityYear(value);
                    clearError("validityYear");
                  }}
                  error={errors.validityYear}
                />
              </div>
            </FormRow>

            <FormRow label="Verification Link">
              <div className="space-y-1.5">
                <FloatingInput
                  id="rera-verification-link"
                  label="Enter verification link"
                  variant="underline"
                  staticLabel
                  value={verificationLink}
                  onChange={(value) => {
                    setVerificationLink(value);
                    clearError("verificationLink");
                  }}
                  error={errors.verificationLink}
                />
                <p className="profile-description-sm">
                  Please share official RERA website link of your RERA Registration. Eg -
                  PR/GJ/AHMEDABAD/AHMEDABAD CITY/AUDA/RAA09493/181221
                </p>
              </div>
            </FormRow>

            <FormRow label="Supporting document" required>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
                  >
                    Choose file
                  </button>
                  <span className="text-sm text-slate-500">
                    {supportingDocument?.name ??
                      existingDocumentName ??
                      "jpeg, pdf, or doc"}
                  </span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_RERA_DOCUMENT_EXTENSIONS}
                  className="hidden"
                  onChange={handleDocumentChange}
                />
                {errors.supportingDocument ? (
                  <p className="text-xs text-red-500" role="alert">
                    {errors.supportingDocument}
                  </p>
                ) : null}
                <p className="profile-description-sm">
                  Please upload your RERA registration supporting document
                </p>
              </div>
            </FormRow>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeForm}
                className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-linear-to-r-navy-blue px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-900/15 transition hover:shadow-slate-900/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section aria-labelledby="rera-details-heading" className="max-w-3xl">
        <div className="mb-5">
          <h1
            id="rera-details-heading"
            className="font-display text-xl font-bold text-slate-900 sm:text-2xl"
          >
            RERA Details
          </h1>
        </div>
        <div className="space-y-4 animate-pulse" aria-hidden>
          {[1, 2].map((item) => (
            <div key={item} className="h-32 rounded-xl border border-slate-100 bg-slate-50/50" />
          ))}
        </div>
      </section>
    );
  }

  if (entries.length === 0) {
    return (
      <section aria-labelledby="rera-details-heading" className="max-w-3xl">
        <div className="mb-5">
          <h1
            id="rera-details-heading"
            className="font-display text-xl font-bold text-slate-900 sm:text-2xl"
          >
            RERA Details
          </h1>
        </div>

        {loadError ? (
          <p
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
            role="alert"
          >
            {loadError}
          </p>
        ) : null}

        <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
          <p className="text-sm text-slate-600">You have not added RERA details.</p>
          <button
            type="button"
            onClick={openAddForm}
            className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-xl bg-linear-to-r-navy-blue px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-900/15 transition hover:shadow-slate-900/25 active:scale-[0.99]"
          >
            Add RERA Details
          </button>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="rera-details-heading" className="max-w-3xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1
          id="rera-details-heading"
          className="font-display text-xl font-bold text-slate-900 sm:text-2xl"
        >
          RERA Details
        </h1>
        <button
          type="button"
          onClick={openAddForm}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700 transition hover:border-sky-300 hover:bg-sky-100 hover:text-sky-800"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add New RERA ID
        </button>
      </div>

      <div className="space-y-4">
        {entries.map((entry) => (
          <ReraEntryCard
            key={entry.id}
            entry={entry}
            onEdit={() => openEditForm(entry)}
            onDelete={() => setDeleteTargetId(entry.id)}
          />
        ))}
      </div>

      {deleteTarget ? (
        <DeleteConfirmModal
          stateName={deleteTarget.state}
          onCancel={() => setDeleteTargetId(null)}
          onConfirm={handleDeleteConfirm}
          isDeleting={isDeleting}
        />
      ) : null}
    </section>
  );
}
