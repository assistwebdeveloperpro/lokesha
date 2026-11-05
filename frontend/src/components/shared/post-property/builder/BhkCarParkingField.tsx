"use client";

import { useState } from "react";
import BhkTabList from "./BhkTabList";
import {
  getBhkAreaTabKey,
  getBhkParkingTabs,
  lookupBhkCarParking,
  type BhkAreaTab,
} from "./bhkAreaDetails";
import ChipSelectField from "../components/ChipSelectField";
import PostPropertyFieldSection from "../components/PostPropertyFieldSection";
import PostPropertyRequiredAsterisk from "../components/PostPropertyRequiredAsterisk";
import type { AmenitiesValues, PropertyTypeId } from "../config/postPropertyForm.shared";
import {
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

function parkingForTab(values: ProjectDetailsValues, tab: BhkAreaTab) {
  const eligible = values.availableSizes.filter((row) => row.bhk);
  const row = eligible.find((item) => getBhkAreaTabKey(item, eligible) === tab.key);

  if (row) {
    return lookupBhkCarParking(values.bhkCarParking, row, eligible) ?? EMPTY_BHK_CAR_PARKING;
  }

  return values.bhkCarParking[tab.key] ?? EMPTY_BHK_CAR_PARKING;
}

export default function BhkCarParkingField({
  values,
  onChange,
  amenities,
  onAmenitiesChange,
  error,
  singleBlock = false,
  hideClubMembership = false,
  propertyType,
  subType,
}: {
  singleBlock?: boolean;
  hideClubMembership?: boolean;
  propertyType?: PropertyTypeId;
  subType?: string;
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
  const tabItems = singleBlock ? [] : getBhkParkingTabs(values, propertyType, subType);
  const [selectedKey, setSelectedKey] = useState("");
  const activeTab =
    tabItems.find((tab) => tab.key === selectedKey) ?? tabItems[0];
  const activeKey = activeTab?.key ?? "";
  const activeParking = activeTab
    ? parkingForTab(values, activeTab)
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
        {tabItems.length === 0 ? (
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
              tabs={tabItems}
              activeKey={activeKey}
              onSelect={setSelectedKey}
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
                  legend={`Car Parking (${activeTab?.bhk ?? activeKey})`}
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
