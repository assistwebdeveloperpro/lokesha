import { useMemo } from "react";
import PostPropertyInput from "../components/PostPropertyInput";
import PostPropertyRequiredAsterisk from "../components/PostPropertyRequiredAsterisk";
import {
  getStateOptions,
  type IndianState,
} from "@/data/indianStatesCities";
import PostPropertyFieldSection from "../components/PostPropertyFieldSection";
import type {
  AddressLocationFieldErrors,
  AddressLocationValues,
} from "../config/postPropertyForm.shared";

export default function AddressLocationField({
  values,
  onChange,
  errors = {},
  hideUnitFields = false,
  projectNameRequired = true,
}: {
  hideUnitFields?: boolean;
  projectNameRequired?: boolean;
  values: AddressLocationValues;
  onChange: <K extends keyof AddressLocationValues>(
    field: K,
    value: AddressLocationValues[K],
  ) => void;
  errors?: AddressLocationFieldErrors;
}) {
  const stateOptions = useMemo(
    () => [{ value: "", label: "Select State" }, ...getStateOptions()],
    [],
  );

  return (
    <PostPropertyFieldSection
      title="Address / Location"
      description="Provide the complete address so buyers can find your property easily"
    >
      <div className="space-y-5 md:space-y-6">
        {hideUnitFields ? null : (
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            <PostPropertyInput
              id="blockNo"
              label="Block No."
              variant="underline"
              prominentLabel
              compactProminentLabel
              value={values.blockNo}
              onChange={(value) => onChange("blockNo", value)}
            />
            <PostPropertyInput
              id="flatNumber"
              label="Flat / House / Shop number"
              variant="underline"
              prominentLabel
              compactProminentLabel
              value={values.flatNumber}
              onChange={(value) => onChange("flatNumber", value)}
            />
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          <PostPropertyInput
            id="projectName"
            label={`Name of Society / Building / Project Name${projectNameRequired ? "*" : ""}`}
            variant="underline"
            prominentLabel
            compactProminentLabel
            value={values.projectName}
            error={errors.projectName}
            onChange={(value) => onChange("projectName", value)}
          />
          <PostPropertyInput
            id="locality"
            label="Locality*"
            variant="underline"
            prominentLabel
            compactProminentLabel
            value={values.locality}
            error={errors.locality}
            onChange={(value) => onChange("locality", value)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          <PostPropertyInput
            id="addressLine2"
            label="Address Line 2"
            variant="underline"
            prominentLabel
            compactProminentLabel
            value={values.addressLine2}
            onChange={(value) => onChange("addressLine2", value)}
          />
          <PostPropertyInput
            id="landmark"
            label="Landmark"
            variant="underline"
            prominentLabel
            compactProminentLabel
            value={values.landmark}
            onChange={(value) => onChange("landmark", value)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          <PostPropertyInput
            id="pinCode"
            label="Pin Code*"
            type="number"
            variant="underline"
            prominentLabel
            compactProminentLabel
            value={values.pinCode}
            error={errors.pinCode}
            onChange={(value) =>
              onChange("pinCode", value.replace(/\D/g, "").slice(0, 6))
            }
          />
          <PostPropertyInput
            id="city"
            label="City"
            variant="underline"
            prominentLabel
            compactProminentLabel
            value={values.city}
            onChange={(value) => onChange("city", value)}
          />
        </div>

        <PostPropertyInput
          id="state"
          ariaLabel="State"
          variant="underline"
          prominentLabel
          compactProminentLabel
          options={stateOptions}
          value={values.state}
          onChange={(value) => onChange("state", value as IndianState | "")}
          dropdownMenuClassName="absolute left-0 z-20 mt-1 max-h-60 w-full min-w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg shadow-slate-900/10"
        />

        <div>
          <label
            htmlFor="propertyDescription"
            className="mb-2.5 block text-sm font-semibold text-slate-700"
          >
            Property Description
            <PostPropertyRequiredAsterisk />
          </label>
          <textarea
            id="propertyDescription"
            value={values.propertyDescription}
            rows={2}
            aria-invalid={Boolean(errors.propertyDescription)}
            placeholder="Describe your property, highlights, and nearby amenities"
            onChange={(event) =>
              onChange("propertyDescription", event.target.value)
            }
            className={`w-full resize-y border-0 border-b bg-transparent px-0 pb-2.5 pt-2 text-sm font-medium leading-relaxed text-slate-600 outline-none transition-colors placeholder:text-slate-400 ${
              errors.propertyDescription
                ? "border-red-500 focus:border-red-500"
                : "border-slate-300 focus:border-sky-600"
            }`}
          />
          {errors.propertyDescription ? (
            <p className="mt-1 text-sm text-red-500" role="alert">
              {errors.propertyDescription}
            </p>
          ) : null}
        </div>
      </div>
    </PostPropertyFieldSection>
  );
}
