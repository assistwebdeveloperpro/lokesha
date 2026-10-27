"use client";

import { FileClock, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import ConfirmDeleteModal from "@/components/shared/ui/ConfirmDeleteModal";
import type { DraftSummary } from "@/services/property.service";
import { FORM_STEPS } from "../config/postPropertyForm.shared";
import { getDraftSubtitle, getDraftTitle, getResumeHref } from "../utils/draftListLabels";

type SavedDraftsBannerProps = {
  drafts: DraftSummary[];
  deletingId: string | null;
  onDelete: (id: string) => Promise<boolean>;
};

const dateFormatter = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" });

export default function SavedDraftsBanner({ drafts, deletingId, onDelete }: SavedDraftsBannerProps) {
  const [pendingDraft, setPendingDraft] = useState<DraftSummary | null>(null);

  const confirmDelete = async () => {
    if (!pendingDraft) return;
    if (await onDelete(pendingDraft.id)) {
      setPendingDraft(null);
    }
  };

  if (drafts.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="saved-drafts-heading"
      className="mt-8 rounded-2xl border border-sky-200 bg-sky-50/60 p-4 sm:p-5"
    >
      <h2 id="saved-drafts-heading" className="flex items-center gap-2 text-base font-bold text-navy-blue">
        <FileClock className="h-5 w-5" aria-hidden />
        Continue where you left off
      </h2>

      <ul className="mt-3 grid gap-3 md:grid-cols-2">
        {drafts.map((draft) => {
          const subtitle = getDraftSubtitle(draft);
          const isDeleting = deletingId === draft.id;

          return (
            <li
              key={draft.id}
              className={`flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 ${isDeleting ? "opacity-60" : ""}`}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900">{getDraftTitle(draft)}</p>
                <p className="truncate text-xs text-slate-500">
                  {subtitle ? `${subtitle} · ` : ""}Step {draft.currentStep} of {FORM_STEPS.length} · Saved{" "}
                  {dateFormatter.format(new Date(draft.updatedAt))}
                </p>
              </div>
              <Link
                href={getResumeHref(draft)}
                className="bg-linear-to-r-navy-blue inline-flex min-h-9 items-center rounded-lg px-4 text-sm font-semibold text-white shadow"
              >
                Continue
              </Link>
              <button
                type="button"
                disabled={isDeleting}
                aria-label={`Delete draft ${getDraftTitle(draft)}`}
                onClick={() => setPendingDraft(draft)}
                className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-red-200 hover:text-red-600 disabled:cursor-not-allowed"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>

      {pendingDraft ? (
        <ConfirmDeleteModal
          title="Delete draft?"
          isDeleting={deletingId === pendingDraft.id}
          onCancel={() => setPendingDraft(null)}
          onConfirm={confirmDelete}
        >
          <span className="font-semibold text-slate-800">{getDraftTitle(pendingDraft)}</span> and its uploaded files
          will be permanently deleted. This cannot be undone.
        </ConfirmDeleteModal>
      ) : null}
    </section>
  );
}
