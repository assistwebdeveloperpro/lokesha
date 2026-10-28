"use client";

import { Fragment, useState, type ReactNode } from "react";
import BhkTabList from "./BhkTabList";
import { getVariantLabel } from "./bhkAreaDetails";
import PostPropertyAmountInput from "../step-5-pricing-and-additional-details/PostPropertyAmountInput";
import PostPropertyFieldSection from "../components/PostPropertyFieldSection";
import PostPropertyInput from "../components/PostPropertyInput";
import type { PricingOthersValues } from "../config/postPropertyForm.shared";
import {
  POST_PROPERTY_BHK_BADGE,
  POST_PROPERTY_BHK_PANEL,
  POST_PROPERTY_INNER_PANEL,
  POST_PROPERTY_SUBSECTION_LABEL,
} from "../config/postPropertyForm.styles";
import {
  EMPTY_BHK_CHARGES,
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

function SectionWrapper({ children }: { children: ReactNode }) {
  return (
    <PostPropertyFieldSection
      title="Other Charges & Remarks"
      description="Add transfer fee, booking amount, and other details"
    >
      {children}
    </PostPropertyFieldSection>
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
  bhkList,
  unitType,
  embedded = false,
}: {
  // BHKs of one sub type; defaults to every BHK of the project
  bhkList?: string[];
  // Label of the sub type the BHKs belong to
  unitType?: string;
  // Rendered inside sub type tabs, so the section heading is skipped
  embedded?: boolean;
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
  const bhks = singleBlock ? [] : (bhkList ?? getSelectedBhks(values));
  const [selectedBhk, setSelectedBhk] = useState("");
  const activeBhk = bhks.includes(selectedBhk) ? selectedBhk : (bhks[0] ?? "");

  // Charges are stored per BHK and unit type, so Flat and Duplex 2 BHK stay apart
  const chargesKey = (bhk: string) => {
    const row = values.availableSizes.find(
      (item) => item.bhk === bhk && (!unitType || !item.unitType || item.unitType === unitType),
    );
    return row ? getVariantLabel(row) : bhk;
  };
  const getCharges = (bhk: string) =>
    values.bhkCharges[chargesKey(bhk)] ?? values.bhkCharges[bhk] ?? EMPTY_BHK_CHARGES;

  const update = (bhk: string, patch: Partial<BhkCharges>) =>
    onChange("bhkCharges", {
      ...values.bhkCharges,
      [chargesKey(bhk)]: { ...getCharges(bhk), ...patch },
    });

  const Wrapper = embedded ? Fragment : SectionWrapper;

  return (
    <Wrapper>
      <div className="space-y-6">
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
          <>
            <BhkTabList
              bhks={bhks}
              activeBhk={activeBhk}
              onSelect={setSelectedBhk}
              label="Charges by BHK"
            />
            <div role="tabpanel" className={POST_PROPERTY_BHK_PANEL}>
              <ChargeFields
                key={activeBhk}
                idSuffix={`-${activeBhk}`}
                values={getCharges(activeBhk)}
                onChange={(patch) => update(activeBhk, patch)}
              />
            </div>
          </>
        )}
      </div>
    </Wrapper>
  );
}
