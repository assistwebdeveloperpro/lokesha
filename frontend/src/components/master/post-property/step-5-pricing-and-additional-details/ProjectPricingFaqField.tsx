import { Plus, X } from "lucide-react";
import ChipSelectField from "../ChipSelectField";
import PostPropertyAmountInput from "./PostPropertyAmountInput";
import PostPropertyFieldSection from "../PostPropertyFieldSection";
import PostPropertyInput from "../PostPropertyInput";
import {
  PAYMENT_PLAN_OPTIONS,
  createRowId,
  type ProjectDetailsValues,
} from "../postPropertyProjectDetails";

type OnChange = <K extends keyof ProjectDetailsValues>(
  field: K,
  value: ProjectDetailsValues[K],
) => void;

export function ProjectPricingField({
  values,
  onChange,
}: {
  values: ProjectDetailsValues;
  onChange: OnChange;
}) {
  return (
    <PostPropertyFieldSection
      title="Project Price & Payment"
      description="Add project price range, payment plan and bank approvals"
    >
      <div className="space-y-5 md:space-y-6">
        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          <PostPropertyAmountInput
            id="priceMin"
            label="Price Range Min"
            placeholder="Price Range Min"
            variant="underline"
            staticLabel
            value={values.priceMin}
            onChange={(value) => onChange("priceMin", value)}
          />
          <PostPropertyAmountInput
            id="priceMax"
            label="Price Range Max"
            placeholder="Price Range Max"
            variant="underline"
            staticLabel
            value={values.priceMax}
            onChange={(value) => onChange("priceMax", value)}
          />
          <PostPropertyAmountInput
            id="pricePerSqft"
            label="Price per sq ft"
            placeholder="Price per sq ft"
            variant="underline"
            staticLabel
            value={values.pricePerSqft}
            onChange={(value) => onChange("pricePerSqft", value)}
          />
        </div>

        <ChipSelectField
          legend="Payment Plan"
          bare
          options={PAYMENT_PLAN_OPTIONS}
          value={values.paymentPlan}
          onChange={(value) => onChange("paymentPlan", value)}
        />

        <PostPropertyInput
          id="approvedBanks"
          label="Approved Banks"
          placeholder="e.g. SBI, HDFC, ICICI"
          variant="underline"
          staticLabel
          value={values.approvedBanks}
          onChange={(value) => onChange("approvedBanks", value)}
        />
      </div>
    </PostPropertyFieldSection>
  );
}

export function VideoWalkthroughField({
  values,
  onChange,
}: {
  values: ProjectDetailsValues;
  onChange: OnChange;
}) {
  return (
    <PostPropertyFieldSection
      title="Video Walkthrough Link"
      description="Paste a YouTube or Vimeo link of the project"
    >
      <PostPropertyInput
        id="videoLink"
        label="Video Link"
        placeholder="https://"
        variant="underline"
        staticLabel
        value={values.videoLink}
        onChange={(value) => onChange("videoLink", value)}
      />
    </PostPropertyFieldSection>
  );
}

export function ProjectFaqField({
  values,
  onChange,
}: {
  values: ProjectDetailsValues;
  onChange: OnChange;
}) {
  const rows = values.faqs;
  const update = (id: string, patch: Partial<(typeof rows)[number]>) =>
    onChange(
      "faqs",
      rows.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );

  return (
    <PostPropertyFieldSection
      title="Project FAQs"
      description="Answer common questions buyers ask about this project"
    >
      <div className="space-y-4">
        {rows.map((row, index) => (
          <div
            key={row.id}
            className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white/70 p-4"
          >
            <div className="grid flex-1 gap-4 md:gap-5">
              <PostPropertyInput
                id={`faqQuestion-${row.id}`}
                label="Question"
                variant="underline"
                prominentLabel
                compactProminentLabel
                value={row.question}
                onChange={(value) => update(row.id, { question: value })}
              />
              <PostPropertyInput
                id={`faqAnswer-${row.id}`}
                label="Answer"
                variant="underline"
                prominentLabel
                compactProminentLabel
                value={row.answer}
                onChange={(value) => update(row.id, { answer: value })}
              />
            </div>
            <button
              type="button"
              aria-label={`Remove FAQ ${index + 1}`}
              disabled={rows.length === 1}
              onClick={() =>
                onChange(
                  "faqs",
                  rows.filter((item) => item.id !== row.id),
                )
              }
              className="mt-1 inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            onChange("faqs", [
              ...rows,
              { id: createRowId(), question: "", answer: "" },
            ])
          }
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed border-sky-300 bg-sky-50/30 px-4 py-2.5 text-sm font-semibold text-sky-700 transition hover:border-sky-500 hover:bg-sky-50/60"
        >
          <Plus className="h-4 w-4" aria-hidden /> Add FAQ
        </button>
      </div>
    </PostPropertyFieldSection>
  );
}
