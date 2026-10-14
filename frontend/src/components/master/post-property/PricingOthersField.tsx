"use client";

import PostPropertyAmountInput from "./PostPropertyAmountInput";
import PostPropertyInput from "./PostPropertyInput";
import ExpandableIconTileSelect from "./ExpandableIconTileSelect";
import PostPropertyFieldSection from "./PostPropertyFieldSection";
import {
  PRICE_INCLUSION_OPTIONS,
  type PricingOthersFieldErrors,
  type PricingOthersValues,
} from "./postPropertyForm.shared";
import { POST_PROPERTY_CHECKBOX_ROW } from "./postPropertyForm.styles";

const checkboxClassName =
  "h-4.5 w-4.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500";

export default function PricingOthersField({
  isRent = false,
  values,
  onChange,
  errors = {},
}: {
  isRent?: boolean;
  values: PricingOthersValues;
  errors?: PricingOthersFieldErrors;
  onChange: <K extends keyof PricingOthersValues>(
    field: K,
    value: PricingOthersValues[K],
  ) => void;
}) {
  if (isRent) {
    return (
      <div className="space-y-5 sm:space-y-6">
        <PostPropertyFieldSection
          title="Rent Details"
          description="Add rent, deposit, and other details"
        >
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            <PostPropertyAmountInput
              id="monthlyRent"
              label="Monthly Rent*"
              placeholder="Monthly Rent"
              variant="underline"
              staticLabel
              value={values.monthlyRent}
              onChange={(nextValue) => onChange("monthlyRent", nextValue)}
              error={errors.monthlyRent}
            />
            <PostPropertyInput
              id="noticePeriod"
              label="Notice Period (In Month)*"
              placeholder="Notice Period (In Month)"
              variant="underline"
              type="number"
              staticLabel
              value={values.noticePeriod}
              onChange={(nextValue) => onChange("noticePeriod", nextValue)}
              error={errors.noticePeriod}
            />
            <PostPropertyAmountInput
              id="depositAmount"
              label="Deposit Amount*"
              placeholder="Deposit Amount"
              variant="underline"
              staticLabel
              value={values.depositAmount}
              onChange={(nextValue) => onChange("depositAmount", nextValue)}
              error={errors.depositAmount}
            />
            <PostPropertyAmountInput
              id="maintenanceCharges"
              label="Maintenance Charges"
              placeholder="Maintenance Charges"
              variant="underline"
              staticLabel
              value={values.maintenanceCharges}
              onChange={(nextValue) => onChange("maintenanceCharges", nextValue)}
            />
            <PostPropertyInput
              id="benefitsRemarks"
              label="Add benefits/Remarks"
              placeholder="Add benefits/Remarks"
              variant="underline"
              staticLabel
              value={values.benefitsRemarks}
              onChange={(nextValue) => onChange("benefitsRemarks", nextValue)}
            />
          </div>
        </PostPropertyFieldSection>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <PostPropertyFieldSection
        title="Expected Price"
        required
        description="Enter the price you expect for this property"
      >
        <PostPropertyAmountInput
          id="expectedPrice"
          label="Expected Price*"
          placeholder="Expected Price"
          variant="underline"
          staticLabel
          value={values.expectedPrice}
          onChange={(nextValue) => onChange("expectedPrice", nextValue)}
          error={errors.expectedPrice}
        />

        <label className={`mt-4 ${POST_PROPERTY_CHECKBOX_ROW}`}>
          <input
            type="checkbox"
            checked={values.priceNegotiable}
            onChange={(event) =>
              onChange("priceNegotiable", event.target.checked)
            }
            className={checkboxClassName}
          />
          <span className="text-sm font-semibold text-slate-800">
            Price Negotiable
          </span>
        </label>
      </PostPropertyFieldSection>

      <ExpandableIconTileSelect
        legend="Price Inclusion"
        options={PRICE_INCLUSION_OPTIONS}
        value={values.priceInclusion}
        onChange={(nextValue) => onChange("priceInclusion", nextValue)}
        visibleCount={PRICE_INCLUSION_OPTIONS.length}
      />

      <PostPropertyFieldSection
        title="Other Charges & Remarks"
        description="Add transfer fee, booking amount, and other details"
      >
        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          <PostPropertyAmountInput
            id="transferFee"
            label="Transfer Fee"
            placeholder="Transfer Fee"
            variant="underline"
            staticLabel
            value={values.transferFee}
            onChange={(nextValue) => onChange("transferFee", nextValue)}
          />
          <PostPropertyAmountInput
            id="bookingAmount"
            label="Booking Amount*"
            placeholder="Booking Amount"
            variant="underline"
            staticLabel
            value={values.bookingAmount}
            onChange={(nextValue) => onChange("bookingAmount", nextValue)}
            error={errors.bookingAmount}
          />
          <PostPropertyAmountInput
            id="maintenanceCharges"
            label="Maintenance Charges"
            placeholder="Maintenance Charges"
            variant="underline"
            staticLabel
            value={values.maintenanceCharges}
            onChange={(nextValue) => onChange("maintenanceCharges", nextValue)}
          />
          <PostPropertyInput
            id="benefitsRemarks"
            label="Add benefits/Remarks"
            placeholder="Add benefits/Remarks"
            variant="underline"
            staticLabel
            value={values.benefitsRemarks}
            onChange={(nextValue) => onChange("benefitsRemarks", nextValue)}
          />
        </div>
      </PostPropertyFieldSection>
    </div>
  );
}
