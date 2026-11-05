"use client";

import { Fragment, useState, type ReactNode } from "react";
import BhkTabList from "./BhkTabList";
import type { BhkAreaTab } from "./bhkAreaDetails";
import PostPropertyAmountInput from "../step-5-pricing-and-additional-details/PostPropertyAmountInput";
import PostPropertyFieldSection from "../components/PostPropertyFieldSection";
import PostPropertyInput from "../components/PostPropertyInput";
import type { PricingOthersValues } from "../config/postPropertyForm.shared";
import {
  POST_PROPERTY_INNER_PANEL,
  POST_PROPERTY_SUBSECTION_LABEL,
} from "../config/postPropertyForm.styles";
import {
  EMPTY_BHK_CHARGES,
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

function getChargesForTab(values: ProjectDetailsValues, tab: BhkAreaTab): BhkCharges {
  return (
    values.bhkCharges[tab.key] ??
    values.bhkCharges[tab.bhk] ??
    EMPTY_BHK_CHARGES
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
  chargeTabs = [],
  embedded = false,
}: {
  chargeTabs?: BhkAreaTab[];
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
  const tabs = singleBlock ? [] : chargeTabs;
  const [selectedKey, setSelectedKey] = useState("");
  const activeTab = tabs.find((tab) => tab.key === selectedKey) ?? tabs[0];

  const update = (tab: BhkAreaTab, patch: Partial<BhkCharges>) =>
    onChange("bhkCharges", {
      ...values.bhkCharges,
      [tab.key]: { ...getChargesForTab(values, tab), ...patch },
    });

  const Wrapper = embedded ? Fragment : SectionWrapper;

  return (
    <Wrapper>
      <div className="space-y-6">
        {tabs.length === 0 ? (
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
              tabs={tabs.map((tab) => ({ key: tab.key, label: tab.label }))}
              activeKey={activeTab?.key ?? ""}
              onSelect={setSelectedKey}
              label="Charges by BHK"
            />
            {activeTab ? (
              <div role="tabpanel" className="space-y-4">
                <ChargeFields
                  key={activeTab.key}
                  idSuffix={`-${activeTab.key.replace(/\W+/g, "-")}`}
                  values={getChargesForTab(values, activeTab)}
                  onChange={(patch) => update(activeTab, patch)}
                />
              </div>
            ) : null}
          </>
        )}
      </div>
    </Wrapper>
  );
}
