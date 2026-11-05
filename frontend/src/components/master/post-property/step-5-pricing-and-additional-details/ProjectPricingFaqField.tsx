import { usePostPropertyReadOnly } from "@/components/shared/post-property/config/postPropertyReadOnly";
import { Plus, X } from "lucide-react";
import ChipSelectField from "../ChipSelectField";
import PostPropertyAmountInput from "./PostPropertyAmountInput";
import PostPropertyFieldSection from "../PostPropertyFieldSection";
import PostPropertyInput from "../PostPropertyInput";
import {
  PAYMENT_PLAN_OPTIONS,
  createRowId,
  getAvailableSizesPriceRange,
  type ProjectDetailsValues,
} from "../postPropertyProjectDetails";

type OnChange = <K extends keyof ProjectDetailsValues>(
  field: K,
  value: ProjectDetailsValues[K],
) => void;

const FAQ_ROW_MIN_HEIGHT = "min-h-[12.5rem] lg:min-h-[8rem]";

function faqListClassName(rowCount: number) {
  if (rowCount <= 3) {
    return "space-y-4";
  }

  return "max-h-[calc(3*12.5rem+2*1rem)] space-y-4 overflow-y-auto overscroll-y-contain pr-0.5 lg:max-h-[calc(3*8rem+2*1rem)]";
}

export function ProjectPricingField({
  values,
  onChange,
  priceRangeReadOnly = false,
}: {
  values: ProjectDetailsValues;
  onChange: OnChange;
  priceRangeReadOnly?: boolean;
}) {
  const range = priceRangeReadOnly
    ? getAvailableSizesPriceRange(values)
    : { min: values.priceMin, max: values.priceMax };

  return (
    <PostPropertyFieldSection
      title="Project Price & Payment"
      description="Add project price range and payment plan"
    >
      <div className="space-y-5 md:space-y-6">
        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          <PostPropertyAmountInput
            id="priceMin"
            label="Price Range Min"
            placeholder="Price Range Min"
            variant="underline"
            staticLabel
            readOnly={priceRangeReadOnly}
            value={range.min}
            onChange={(value) => onChange("priceMin", value)}
          />
          <PostPropertyAmountInput
            id="priceMax"
            label="Price Range Max"
            placeholder="Price Range Max"
            variant="underline"
            staticLabel
            readOnly={priceRangeReadOnly}
            value={range.max}
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

export function VirtualTourField({
  values,
  onChange,
}: {
  values: ProjectDetailsValues;
  onChange: OnChange;
}) {
  return (
    <PostPropertyFieldSection
      title="Virtual Tour Link"
      description="Paste a 360° or virtual tour link of the project"
    >
      <PostPropertyInput
        id="virtualTourLink"
        label="Virtual Tour Link"
        placeholder="https://"
        type="url"
        variant="underline"
        staticLabel
        value={values.virtualTourLink}
        onChange={(value) => onChange("virtualTourLink", value)}
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
  const readOnly = usePostPropertyReadOnly();
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
        <div className={faqListClassName(rows.length)}>
          {rows.map((row, index) => {
            const faqNumber = index + 1;

            return (
              <div
                key={row.id}
                role="group"
                aria-label={`FAQ ${faqNumber}`}
                className={`rounded-xl border border-slate-200/80 bg-white/70 p-3 sm:p-4 ${FAQ_ROW_MIN_HEIGHT}`}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-sky-200/90 bg-sky-100 px-1.5 text-xs font-bold tabular-nums leading-none text-sky-800">
                    {faqNumber}
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove FAQ ${faqNumber}`}
                    disabled={readOnly || rows.length === 1}
                    onClick={() =>
                      onChange(
                        "faqs",
                        rows.filter((item) => item.id !== row.id),
                      )
                    }
                    className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
                <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
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
              </div>
            );
          })}
        </div>
        {readOnly ? null : (
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
        )}
      </div>
    </PostPropertyFieldSection>
  );
}
