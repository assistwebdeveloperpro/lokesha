"use client";

import { useState } from "react";
import { getVariantLabel } from "./bhkAreaDetails";
import BhkTabList from "./BhkTabList";
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
} from "../config/postPropertyForm.styles";
import {
  EMPTY_BHK_CAR_PARKING,
  type BhkCarParking,
  type ProjectDetailsValues,
} from "@/components/master/post-property/postPropertyProjectDetails";

const checkboxClassName =
  "h-4.5 w-4.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500";

const COUNT_OPTIONS = ["1", "2", "3", "4", "5", "6", "7"];
const MORE_COUNT_OPTIONS = ["8", "9", "10"];

type ParkingTab = { key: string; bhk: string };

// Parking is stored per BHK and unit type; the unit type is only shown when a BHK repeats
function getParkingTabs(values: ProjectDetailsValues): Map<string, ParkingTab> {
  const rows = values.availableSizes.filter((row) => row.bhk);
  const unitTypesByBhk = new Map<string, Set<string>>();
  for (const row of rows) {
    unitTypesByBhk.set(row.bhk, (unitTypesByBhk.get(row.bhk) ?? new Set()).add(row.unitType));
  }

  const tabs = new Map<string, ParkingTab>();
  for (const row of rows) {
    const key = getVariantLabel(row);
    const isRepeated = (unitTypesByBhk.get(row.bhk)?.size ?? 0) > 1;
    tabs.set(isRepeated ? key : row.bhk, { key, bhk: row.bhk });
  }
  return tabs;
}

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
  const tabs = singleBlock ? new Map<string, ParkingTab>() : getParkingTabs(values);
  const bhks = [...tabs.keys()];
  const [selectedBhk, setSelectedBhk] = useState("");
  const activeBhk = bhks.includes(selectedBhk) ? selectedBhk : (bhks[0] ?? "");
  const activeTab = tabs.get(activeBhk);
  const activeParking = activeTab
    ? (values.bhkCarParking[activeTab.key] ??
      values.bhkCarParking[activeTab.bhk] ??
      EMPTY_BHK_CAR_PARKING)
    : EMPTY_BHK_CAR_PARKING;

  const update = (patch: Partial<BhkCarParking>) => {
    if (!activeTab) {
      return;
    }

    onChange("bhkCarParking", {
      ...values.bhkCarParking,
      [activeTab.key]: { ...activeParking, ...patch },
    });
  };

  return (
    <PostPropertyFieldSection
      title={hideClubMembership ? "Parking" : "Parking & Membership"}
      description={
        singleBlock
          ? "Tell buyers about the car parking in this project"
          : "Set car parking and club membership for each BHK selected in Available Sizes"
      }
    >
      <div className="space-y-6">
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
          <>
            <BhkTabList
              bhks={bhks}
              activeBhk={activeBhk}
              onSelect={setSelectedBhk}
              label="Parking by BHK"
            />
            <div role="tabpanel" className={POST_PROPERTY_BHK_PANEL}>
              <label className={POST_PROPERTY_CHECKBOX_ROW}>
                <input
                  type="checkbox"
                  checked={activeParking.available}
                  onChange={(event) =>
                    update({
                      available: event.target.checked,
                      count: event.target.checked ? activeParking.count : "",
                    })
                  }
                  className={checkboxClassName}
                />
                <span className="text-sm font-semibold text-slate-800">
                  Car Parking Available
                </span>
              </label>
              {activeParking.available ? (
                <ChipSelectField
                  legend={`Car Parking (${activeBhk})`}
                  bare
                  options={COUNT_OPTIONS}
                  value={activeParking.count}
                  onChange={(value) => update({ count: value })}
                  moreOptions={MORE_COUNT_OPTIONS}
                />
              ) : null}
              <label className={POST_PROPERTY_CHECKBOX_ROW}>
                <input
                  type="checkbox"
                  checked={activeParking.clubMembership}
                  onChange={(event) => update({ clubMembership: event.target.checked })}
                  className={checkboxClassName}
                />
                <span className="text-sm font-semibold text-slate-800">
                  Club Membership
                </span>
              </label>
            </div>
          </>
        )}
      </div>
    </PostPropertyFieldSection>
  );
}
