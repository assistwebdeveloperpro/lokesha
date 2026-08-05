"use client";

import FloatingInput from "@/components/shared/FloatingInput";
import ChipSelectField from "./ChipSelectField";
import ExpandableIconTileSelect from "./ExpandableIconTileSelect";
import PostPropertyFieldSection from "./PostPropertyFieldSection";
import {
  AMENITY_OPTIONS,
  FACING_OPTIONS,
  FURNISHING_OPTIONS,
  FURNISHING_STATUS_OPTIONS,
  showsFurnishingField,
  type AmenitiesValues,
  type FacingOption,
  type FurnishingStatusId,
} from "./postPropertyForm.shared";
import { POST_PROPERTY_CHECKBOX_ROW } from "./postPropertyForm.styles";

const checkboxClassName =
  "h-4.5 w-4.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500";

export default function AmenitiesField({
  values,
  onChange,
}: {
  values: AmenitiesValues;
  onChange: <K extends keyof AmenitiesValues>(
    field: K,
    value: AmenitiesValues[K],
  ) => void;
}) {
  const showFurnishing = showsFurnishingField(values.status);

  const handleStatusChange = (label: string) => {
    const match = FURNISHING_STATUS_OPTIONS.find(
      (option) => option.label === label,
    );
    const nextStatus = (match?.id ?? "") as FurnishingStatusId | "";
    onChange("status", nextStatus);

    if (!showsFurnishingField(nextStatus)) {
      onChange("furnishing", []);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <PostPropertyFieldSection
        title="Status & Furnishing"
        required
        description="Choose furnished status and select available items"
      >
        <ChipSelectField
          legend="Status"
          required
          bare
          options={FURNISHING_STATUS_OPTIONS.map((option) => option.label)}
          value={
            FURNISHING_STATUS_OPTIONS.find(
              (option) => option.id === values.status,
            )?.label ?? ""
          }
          onChange={handleStatusChange}
        />

        {showFurnishing ? (
          <div className="mt-5">
            <ExpandableIconTileSelect
              legend="Furnishing"
              required
              bare
              options={FURNISHING_OPTIONS}
              value={values.furnishing}
              onChange={(nextValue) => onChange("furnishing", nextValue)}
            />
          </div>
        ) : null}
      </PostPropertyFieldSection>

      <ExpandableIconTileSelect
        legend="Amenities"
        required
        options={AMENITY_OPTIONS}
        value={values.amenities}
        onChange={(nextValue) => onChange("amenities", nextValue)}
      />

      <ChipSelectField
        legend="Facing"
        options={[...FACING_OPTIONS]}
        value={values.facing}
        onChange={(label) => onChange("facing", label as FacingOption | "")}
      />

      <PostPropertyFieldSection title="Parking & Membership">
        <div className="space-y-4">
          <label className={POST_PROPERTY_CHECKBOX_ROW}>
            <input
              type="checkbox"
              checked={values.carParkingAvailable}
              onChange={(event) => {
                const isChecked = event.target.checked;
                onChange("carParkingAvailable", isChecked);
                if (!isChecked) {
                  onChange("carParking", "");
                }
              }}
              className={checkboxClassName}
            />
            <span className="text-sm font-semibold text-slate-800">
              Car Parking Available
              <span className="ml-0.5 text-sky-600">*</span>
            </span>
          </label>

          {values.carParkingAvailable ? (
            <ChipSelectField
              legend="Car Parking"
              required
              bare
              options={["1", "2", "3", "4", "5", "6", "7"]}
              value={values.carParking}
              onChange={(nextValue) => onChange("carParking", nextValue)}
              moreOptions={["8", "9", "10"]}
            />
          ) : null}

          <label className={POST_PROPERTY_CHECKBOX_ROW}>
            <input
              type="checkbox"
              checked={values.clubMembership}
              onChange={(event) =>
                onChange("clubMembership", event.target.checked)
              }
              className={checkboxClassName}
            />
            <span className="text-sm font-semibold text-slate-800">
              Club Membership
            </span>
          </label>
        </div>
      </PostPropertyFieldSection>

      <PostPropertyFieldSection title="Additional Details">
        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          <FloatingInput
            id="reraNumber"
            label="RERA Number"
            placeholder="RERA Number"
            variant="underline"
            staticLabel
            value={values.reraNumber}
            onChange={(nextValue) => onChange("reraNumber", nextValue)}
          />
          <FloatingInput
            id="openSides"
            label="No. of open sides"
            placeholder="No. of open sides"
            variant="underline"
            staticLabel
            type="number"
            value={values.openSides}
            onChange={(nextValue) => onChange("openSides", nextValue)}
          />
        </div>
      </PostPropertyFieldSection>
    </div>
  );
}
