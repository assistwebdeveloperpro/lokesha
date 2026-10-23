"use client";

import ChipSelectField from "../components/ChipSelectField";
import PostPropertyFieldSection from "../components/PostPropertyFieldSection";
import PostPropertyRequiredAsterisk from "../components/PostPropertyRequiredAsterisk";
import type { AmenitiesValues } from "../config/postPropertyForm.shared";
import {
  POST_PROPERTY_BHK_BADGE,
  POST_PROPERTY_BHK_PANEL,
  POST_PROPERTY_CHECKBOX_ROW,
  POST_PROPERTY_INNER_PANEL,
  POST_PROPERTY_SUBSECTION_LABEL,
  postPropertyChipClass,
} from "../config/postPropertyForm.styles";
import {
  BHK_OPTIONS,
  EMPTY_BHK_CAR_PARKING,
  getChargeBhks,
  getSelectedBhks,
  type BhkCarParking,
  type ProjectDetailsValues,
} from "@/components/master/post-property/postPropertyProjectDetails";

const checkboxClassName =
  "h-4.5 w-4.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500";

const COUNT_OPTIONS = ["1", "2", "3", "4", "5", "6", "7"];
const MORE_COUNT_OPTIONS = ["8", "9", "10"];

export default function BhkCarParkingField({
  values,
  onChange,
  amenities,
  onAmenitiesChange,
  error,
  singleBlock = false,
  hideClubMembership = false,
}: {
  singleBlock?: boolean;
  hideClubMembership?: boolean;
  values: ProjectDetailsValues;
  onChange: <K extends keyof ProjectDetailsValues>(
    field: K,
    value: ProjectDetailsValues[K],
  ) => void;
  amenities: AmenitiesValues;
  onAmenitiesChange: <K extends keyof AmenitiesValues>(
    field: K,
    value: AmenitiesValues[K],
  ) => void;
  error?: string;
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

  const update = (bhk: string, patch: Partial<BhkCarParking>) =>
    onChange("bhkCarParking", {
      ...values.bhkCarParking,
      [bhk]: { ...(values.bhkCarParking[bhk] ?? EMPTY_BHK_CAR_PARKING), ...patch },
    });

  return (
    <PostPropertyFieldSection
      title={hideClubMembership ? "Parking" : "Parking & Membership"}
      description={
        singleBlock
          ? "Tell buyers about the car parking in this project"
          : "Select a BHK to set its car parking and club membership separately"
      }
    >
      <div className="space-y-6">
        {singleBlock ? null : (
        <div className={POST_PROPERTY_INNER_PANEL}>
          <p className={POST_PROPERTY_SUBSECTION_LABEL}>Select BHK</p>
          <p className="mb-3 text-sm text-slate-500">
            BHKs from Available Sizes are pre-selected. Add more to configure
            parking separately.
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
              <p className={POST_PROPERTY_SUBSECTION_LABEL}>Project-wide defaults</p>
            )}
            <label className={POST_PROPERTY_CHECKBOX_ROW}>
              <input
                type="checkbox"
                checked={amenities.carParkingAvailable}
                onChange={(event) => {
                  onAmenitiesChange("carParkingAvailable", event.target.checked);
                  if (!event.target.checked) {
                    onAmenitiesChange("carParking", "");
                  }
                }}
                className={checkboxClassName}
              />
              <span className="text-sm font-semibold text-slate-800">
                Car Parking Available
                <PostPropertyRequiredAsterisk />
              </span>
            </label>
            {amenities.carParkingAvailable ? (
              <ChipSelectField
                legend="Car Parking"
                required
                bare
                options={COUNT_OPTIONS}
                value={amenities.carParking}
                onChange={(value) => onAmenitiesChange("carParking", value)}
                moreOptions={MORE_COUNT_OPTIONS}
                error={error}
              />
            ) : null}
            {hideClubMembership ? null : (
              <label className={POST_PROPERTY_CHECKBOX_ROW}>
                <input
                  type="checkbox"
                  checked={amenities.clubMembership}
                  onChange={(event) =>
                    onAmenitiesChange("clubMembership", event.target.checked)
                  }
                  className={checkboxClassName}
                />
                <span className="text-sm font-semibold text-slate-800">
                  Club Membership
                </span>
              </label>
            )}
          </div>
        ) : (
          bhks.map((bhk) => {
            const parking = values.bhkCarParking[bhk] ?? EMPTY_BHK_CAR_PARKING;

            return (
              <div key={bhk} className={POST_PROPERTY_BHK_PANEL}>
                <span className={POST_PROPERTY_BHK_BADGE}>{bhk}</span>
                <label className={POST_PROPERTY_CHECKBOX_ROW}>
                  <input
                    type="checkbox"
                    checked={parking.available}
                    onChange={(event) =>
                      update(bhk, {
                        available: event.target.checked,
                        count: event.target.checked ? parking.count : "",
                      })
                    }
                    className={checkboxClassName}
                  />
                  <span className="text-sm font-semibold text-slate-800">
                    Car Parking Available
                  </span>
                </label>
                {parking.available ? (
                  <ChipSelectField
                    legend={`Car Parking (${bhk})`}
                    bare
                    options={COUNT_OPTIONS}
                    value={parking.count}
                    onChange={(value) => update(bhk, { count: value })}
                    moreOptions={MORE_COUNT_OPTIONS}
                  />
                ) : null}
                <label className={POST_PROPERTY_CHECKBOX_ROW}>
                  <input
                    type="checkbox"
                    checked={parking.clubMembership}
                    onChange={(event) =>
                      update(bhk, { clubMembership: event.target.checked })
                    }
                    className={checkboxClassName}
                  />
                  <span className="text-sm font-semibold text-slate-800">
                    Club Membership
                  </span>
                </label>
              </div>
            );
          })
        )}
      </div>
    </PostPropertyFieldSection>
  );
}
