"use client";

import PostPropertyAmountInput from "../step-5-pricing-and-additional-details/PostPropertyAmountInput";
import PostPropertyFieldSection from "../PostPropertyFieldSection";
import PostPropertyInput from "../PostPropertyInput";
import type { PricingOthersValues } from "../postPropertyForm.shared";
import {
  POST_PROPERTY_BHK_BADGE,
  POST_PROPERTY_BHK_PANEL,
  POST_PROPERTY_INNER_PANEL,
  POST_PROPERTY_SUBSECTION_LABEL,
  postPropertyChipClass,
} from "../postPropertyForm.styles";
import {
  BHK_OPTIONS,
  EMPTY_BHK_CHARGES,
  getChargeBhks,
  getSelectedBhks,
  type BhkCharges,
  type ProjectDetailsValues,
} from "@/components/master/post-property/postPropertyProjectDetails";

type ChargeFieldsProps = {
  values: BhkCharges;
  idSuffix: string;
  onChange: (patch: Partial<BhkCharges>) => void;
};

function ChargeFields({ values, idSuffix, onChange }: ChargeFieldsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-6">
      <PostPropertyAmountInput
        id={`transferFee${idSuffix}`}
        label="Transfer Fee"
        placeholder="Transfer Fee"
        variant="underline"
        staticLabel
        value={values.transferFee}
        onChange={(value) => onChange({ transferFee: value })}
      />
      <PostPropertyAmountInput
        id={`bookingAmount${idSuffix}`}
        label="Booking Amount"
        placeholder="Booking Amount"
        variant="underline"
        staticLabel
        value={values.bookingAmount}
        onChange={(value) => onChange({ bookingAmount: value })}
      />
      <PostPropertyAmountInput
        id={`maintenanceCharges${idSuffix}`}
        label="Maintenance Charges"
        placeholder="Maintenance Charges"
        variant="underline"
        staticLabel
        value={values.maintenanceCharges}
        onChange={(value) => onChange({ maintenanceCharges: value })}
      />
      <PostPropertyInput
        id={`benefitsRemarks${idSuffix}`}
        label="Add benefits/Remarks"
        placeholder="Add benefits/Remarks"
        variant="underline"
        staticLabel
        value={values.benefitsRemarks}
        onChange={(value) => onChange({ benefitsRemarks: value })}
      />
    </div>
  );
}

export default function BhkChargesField({
  values,
  onChange,
  pricingOthers,
  onPricingOthersChange,
  singleBlock = false,
  showAssuredReturn = false,
  assuredReturnError,
}: {
  singleBlock?: boolean;
  showAssuredReturn?: boolean;
  assuredReturnError?: string;
  values: ProjectDetailsValues;
  onChange: <K extends keyof ProjectDetailsValues>(
    field: K,
    value: ProjectDetailsValues[K],
  ) => void;
  pricingOthers: PricingOthersValues;
  onPricingOthersChange: <K extends keyof PricingOthersValues>(
    field: K,
    value: PricingOthersValues[K],
  ) => void;
}) {
  const fromSizes = getSelectedBhks(values);
  const bhks = singleBlock ? [] : getChargeBhks(values);

  // BHKs from step 2 stay selected; the rest can be toggled here
  const toggleBhk = (bhk: string) => {
    if (fromSizes.includes(bhk)) {
      return;
    }
    onChange(
      "chargeBhks",
      values.chargeBhks.includes(bhk)
        ? values.chargeBhks.filter((item) => item !== bhk)
        : [...values.chargeBhks, bhk],
    );
  };

  const update = (bhk: string, patch: Partial<BhkCharges>) =>
    onChange("bhkCharges", {
      ...values.bhkCharges,
      [bhk]: { ...(values.bhkCharges[bhk] ?? EMPTY_BHK_CHARGES), ...patch },
    });

  return (
    <PostPropertyFieldSection
      title="Other Charges & Remarks"
      description="Add transfer fee, booking amount, and other details"
    >
      <div className="space-y-6">
        {singleBlock ? null : (
        <div className={POST_PROPERTY_INNER_PANEL}>
          <p className={POST_PROPERTY_SUBSECTION_LABEL}>Select BHK</p>
          <p className="mb-3 text-sm text-slate-500">
            BHKs from Available Sizes are pre-selected. Add more to set charges
            per configuration.
          </p>
          <div className="flex flex-wrap gap-2.5">
            {BHK_OPTIONS.map((bhk) => {
              const isSelected = bhks.includes(bhk);

              return (
                <button
                  key={bhk}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => toggleBhk(bhk)}
                  className={`${postPropertyChipClass(isSelected)} min-w-11 px-3.5 py-2.5 text-sm sm:min-w-12 sm:px-4`}
                >
                  {bhk}
                </button>
              );
            })}
          </div>
        </div>
        )}

        {bhks.length === 0 ? (
          <div className={`${POST_PROPERTY_INNER_PANEL} space-y-4`}>
            {singleBlock ? null : (
              <p className={`${POST_PROPERTY_SUBSECTION_LABEL} mb-4`}>
                Project-wide charges
              </p>
            )}
            {showAssuredReturn ? (
              <div className="grid gap-4 md:grid-cols-2 md:gap-6">
                <PostPropertyInput
                  id="assuredReturn"
                  label="Assured Return in Percentage"
                  placeholder="Assured Return in Percentage"
                  variant="underline"
                  type="number"
                  min="0"
                  max="100"
                  staticLabel
                  value={pricingOthers.assuredReturn}
                  error={assuredReturnError}
                  onChange={(value) => onPricingOthersChange("assuredReturn", value)}
                />
              </div>
            ) : null}
          <ChargeFields
            idSuffix=""
            values={{
              transferFee: pricingOthers.transferFee,
              bookingAmount: pricingOthers.bookingAmount,
              maintenanceCharges: pricingOthers.maintenanceCharges,
              benefitsRemarks: pricingOthers.benefitsRemarks,
            }}
            onChange={(patch) => {
              for (const [field, value] of Object.entries(patch)) {
                onPricingOthersChange(field as keyof BhkCharges, value);
              }
            }}
          />
          </div>
        ) : (
          bhks.map((bhk) => (
            <div key={bhk} className={POST_PROPERTY_BHK_PANEL}>
              <span className={POST_PROPERTY_BHK_BADGE}>{bhk}</span>
              <ChargeFields
                idSuffix={`-${bhk}`}
                values={values.bhkCharges[bhk] ?? EMPTY_BHK_CHARGES}
                onChange={(patch) => update(bhk, patch)}
              />
            </div>
          ))
        )}
      </div>
    </PostPropertyFieldSection>
  );
}
