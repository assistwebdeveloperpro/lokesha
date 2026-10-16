"use client";

import PostPropertyAmountInput from "./PostPropertyAmountInput";
import PostPropertyInput from "../PostPropertyInput";
import ExpandableIconTileSelect from "../ExpandableIconTileSelect";
import PostPropertyFieldSection from "../PostPropertyFieldSection";
import { getSaleFormConfig } from "../postPropertySaleConfig";
import {
  PRICE_INCLUSION_OPTIONS,
  type PricingOthersFieldErrors,
  type PricingOthersValues,
  type PropertyTypeId,
} from "../postPropertyForm.shared";
import { POST_PROPERTY_CHECKBOX_ROW } from "../postPropertyForm.styles";

const checkboxClassName =
  "h-4.5 w-4.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500";

export default function PricingOthersField({
  isRent = false,
  propertyType = "residential",
  subType,
  values,
  onChange,
  errors = {},
}: {
  isRent?: boolean;
  propertyType?: PropertyTypeId;
  subType?: string;
  values: PricingOthersValues;
  errors?: PricingOthersFieldErrors;
  onChange: <K extends keyof PricingOthersValues>(
    field: K,
    value: PricingOthersValues[K],
  ) => void;
}) {
  const isPg = propertyType === "pg-co-living";
  const isPlot = propertyType === "plot";
  const isLand = propertyType === "land";
  const isCommercial = propertyType === "commercial";
  const saleConfig = getSaleFormConfig(
    isRent ? "rent-lease" : "sale",
    propertyType,
    subType,
  )?.pricing;

  if (saleConfig) {
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

        {saleConfig.priceInclusion ? (
          <ExpandableIconTileSelect
            legend="Price Inclusion"
            options={PRICE_INCLUSION_OPTIONS}
            value={values.priceInclusion}
            onChange={(nextValue) => onChange("priceInclusion", nextValue)}
            visibleCount={PRICE_INCLUSION_OPTIONS.length}
          />
        ) : null}

        <PostPropertyFieldSection
          title="Other Charges & Remarks"
          description="Add transfer fee, booking amount, and other details"
        >
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            {saleConfig.assuredReturn ? (
              <PostPropertyInput
                id="assuredReturn"
                label="Assured Return in Percentage"
                placeholder="Assured Return in Percentage"
                variant="underline"
                type="number"
                min="0"
                max="100"
                staticLabel
                value={values.assuredReturn}
                onChange={(nextValue) => onChange("assuredReturn", nextValue)}
              />
            ) : null}
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
              label={`Booking Amount${saleConfig.bookingAmount === "required" ? "*" : ""}`}
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
            {saleConfig.leaseAmount ? (
              <PostPropertyAmountInput
                id="leaseAmount"
                label="Lease Amount"
                placeholder="Lease Amount"
                variant="underline"
                staticLabel
                value={values.leaseAmount}
                onChange={(nextValue) => onChange("leaseAmount", nextValue)}
              />
            ) : null}
            {saleConfig.yearlyIncrement ? (
              <PostPropertyInput
                id="yearlyIncrement"
                label="Yearly Increment in Percentage"
                placeholder="Yearly Increment in Percentage"
                variant="underline"
                type="number"
                min="0"
                max="100"
                staticLabel
                value={values.yearlyIncrement}
                onChange={(nextValue) => onChange("yearlyIncrement", nextValue)}
              />
            ) : null}
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

  if (isPlot) {
    return (
      <div className="space-y-5 sm:space-y-6">
        <PostPropertyFieldSection
          title="Other Charges & Remarks"
          description="Add deposit, rent, and other details"
        >
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
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
              id="monthlyRent"
              label="Monthly Rent*"
              placeholder="Monthly Rent"
              variant="underline"
              staticLabel
              value={values.monthlyRent}
              onChange={(nextValue) => onChange("monthlyRent", nextValue)}
              error={errors.monthlyRent}
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

  if (isRent && !isLand) {
    return (
      <div className="space-y-5 sm:space-y-6">
        <PostPropertyFieldSection
          title="Rent Details"
          description="Add rent, deposit, and other details"
        >
          {isPg ? (
            <label className={`mb-4 ${POST_PROPERTY_CHECKBOX_ROW}`}>
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
          ) : null}
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
            {isPg ? (
              <PostPropertyInput
                id="yearlyIncrement"
                label="Yearly Increment in Percentage"
                placeholder="Yearly Increment in Percentage"
                variant="underline"
                type="number"
                staticLabel
                value={values.yearlyIncrement}
                onChange={(nextValue) => onChange("yearlyIncrement", nextValue)}
              />
            ) : (
              <PostPropertyAmountInput
                id="maintenanceCharges"
                label="Maintenance Charges"
                placeholder="Maintenance Charges"
                variant="underline"
                staticLabel
                value={values.maintenanceCharges}
                onChange={(nextValue) =>
                  onChange("maintenanceCharges", nextValue)
                }
              />
            )}
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

  const assuredReturnField = (
    <PostPropertyInput
      id="assuredReturn"
      label="Assured Return in Percentage"
      placeholder="Assured Return in Percentage"
      variant="underline"
      type="number"
      staticLabel
      value={values.assuredReturn}
      onChange={(nextValue) => onChange("assuredReturn", nextValue)}
    />
  );

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

      {isCommercial || isLand ? null : (
        <ExpandableIconTileSelect
          legend="Price Inclusion"
          options={PRICE_INCLUSION_OPTIONS}
          value={values.priceInclusion}
          onChange={(nextValue) => onChange("priceInclusion", nextValue)}
          visibleCount={PRICE_INCLUSION_OPTIONS.length}
        />
      )}

      <PostPropertyFieldSection
        title="Other Charges & Remarks"
        description="Add transfer fee, booking amount, and other details"
      >
        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          {isLand ? null : (
            <PostPropertyAmountInput
              id="transferFee"
              label="Transfer Fee"
              placeholder="Transfer Fee"
              variant="underline"
              staticLabel
              value={values.transferFee}
              onChange={(nextValue) => onChange("transferFee", nextValue)}
            />
          )}
          {isLand ? (
            <PostPropertyAmountInput
              id="maintenanceCharges"
              label="Maintenance Charges"
              placeholder="Maintenance Charges"
              variant="underline"
              staticLabel
              value={values.maintenanceCharges}
              onChange={(nextValue) =>
                onChange("maintenanceCharges", nextValue)
              }
            />
          ) : null}
          {isLand || isCommercial ? assuredReturnField : null}
          {isLand ? (
            <PostPropertyAmountInput
              id="transferFee"
              label="Transfer Fee"
              placeholder="Transfer Fee"
              variant="underline"
              staticLabel
              value={values.transferFee}
              onChange={(nextValue) => onChange("transferFee", nextValue)}
            />
          ) : null}
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
          {isLand ? null : (
            <PostPropertyAmountInput
              id="maintenanceCharges"
              label="Maintenance Charges"
              placeholder="Maintenance Charges"
              variant="underline"
              staticLabel
              value={values.maintenanceCharges}
              onChange={(nextValue) =>
                onChange("maintenanceCharges", nextValue)
              }
            />
          )}
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
