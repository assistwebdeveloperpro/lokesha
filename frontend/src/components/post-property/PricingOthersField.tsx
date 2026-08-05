"use client";

import FloatingInput from "@/components/shared/FloatingInput";
import ExpandableIconTileSelect from "./ExpandableIconTileSelect";
import PostPropertyFieldSection from "./PostPropertyFieldSection";
import {
  PRICE_INCLUSION_OPTIONS,
  type PricingOthersValues,
} from "./postPropertyForm.shared";
import { POST_PROPERTY_CHECKBOX_ROW } from "./postPropertyForm.styles";

const checkboxClassName =
  "h-4.5 w-4.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500";

export default function PricingOthersField({
  values,
  onChange,
}: {
  values: PricingOthersValues;
  onChange: <K extends keyof PricingOthersValues>(
    field: K,
    value: PricingOthersValues[K],
  ) => void;
}) {
  return (
    <div className="space-y-5 sm:space-y-6">
      <PostPropertyFieldSection
        title="Expected Price"
        required
        description="Enter the price you expect for this property"
      >
        <FloatingInput
          id="expectedPrice"
          label="Expected Price*"
          placeholder="Expected Price"
          variant="underline"
          staticLabel
          type="number"
          value={values.expectedPrice}
          onChange={(nextValue) => onChange("expectedPrice", nextValue)}
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
          <FloatingInput
            id="transferFee"
            label="Transfer Fee"
            placeholder="Transfer Fee"
            variant="underline"
            staticLabel
            type="number"
            value={values.transferFee}
            onChange={(nextValue) => onChange("transferFee", nextValue)}
          />
          <FloatingInput
            id="bookingAmount"
            label="Booking Amount*"
            placeholder="Booking Amount"
            variant="underline"
            staticLabel
            type="number"
            value={values.bookingAmount}
            onChange={(nextValue) => onChange("bookingAmount", nextValue)}
          />
          <FloatingInput
            id="maintenanceCharges"
            label="Maintenance Charges"
            placeholder="Maintenance Charges"
            variant="underline"
            staticLabel
            type="number"
            value={values.maintenanceCharges}
            onChange={(nextValue) => onChange("maintenanceCharges", nextValue)}
          />
          <FloatingInput
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
