import FloatingInput from "@/components/shared/FloatingInput";
import ChipSelectField from "./ChipSelectField";
import PostPropertyFieldSection from "./PostPropertyFieldSection";
import {
  AGE_OF_CONSTRUCTION_OPTIONS,
  AREA_TYPE_OPTIONS,
  CONSTRUCTION_STATUS_OPTIONS,
  PROPERTY_TRANSACTION_OPTIONS,
  getFloorNumberOptionGroups,
  type AgeOfConstructionId,
  type AreaTypeId,
  type ConstructionStatusId,
  type PropertyDetailsValues,
} from "./postPropertyForm.shared";

const areaTypeDropdownOptions = [
  { value: "", label: "Select unit" },
  ...AREA_TYPE_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  })),
];

const dropdownMenuClassName =
  "absolute left-0 z-20 mt-1 max-h-60 w-full min-w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg shadow-slate-900/10";

export default function PropertyDetailsField({
  values,
  onChange,
}: {
  values: PropertyDetailsValues;
  onChange: <K extends keyof PropertyDetailsValues>(
    field: K,
    value: PropertyDetailsValues[K],
  ) => void;
}) {
  const { options: floorNumberOptions, moreOptions: floorNumberMoreOptions } =
    getFloorNumberOptionGroups(values.totalFloors);

  return (
    <div className="space-y-5 sm:space-y-6">
      <PostPropertyFieldSection
        title="Area Details"
        description="Enter carpet area and super build-up measurements"
      >
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            <FloatingInput
              id="carpetAreaNumber"
              label="Carpet Area Number*"
              placeholder="Enter carpet area"
              variant="underline"
              type="number"
              staticLabel
              value={values.carpetAreaNumber}
              onChange={(value) => onChange("carpetAreaNumber", value)}
            />
            <FloatingInput
              id="carpetAreaType"
              label="Carpet Area Type*"
              variant="underline"
              staticLabel
              options={areaTypeDropdownOptions}
              value={values.carpetAreaType}
              onChange={(value) =>
                onChange("carpetAreaType", value as AreaTypeId | "")
              }
              dropdownMenuClassName={dropdownMenuClassName}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            <FloatingInput
              id="superBuildUpNumber"
              label="Super Build up Number"
              placeholder="Enter super build up area"
              variant="underline"
              staticLabel
              value={values.superBuildUpNumber}
              type="number"
              onChange={(value) => onChange("superBuildUpNumber", value)}
            />
            <FloatingInput
              id="superBuildUpType"
              label="Super Build up Type"
              variant="underline"
              staticLabel
              options={areaTypeDropdownOptions}
              value={values.superBuildUpType}
              onChange={(value) =>
                onChange("superBuildUpType", value as AreaTypeId | "")
              }
              dropdownMenuClassName={dropdownMenuClassName}
            />
          </div>
        </div>
      </PostPropertyFieldSection>

      <PostPropertyFieldSection
        title="Property Transaction & Construction Status"
        required
        description="Select transaction type and related construction details"
      >
        <ChipSelectField
          legend="Property Transaction"
          required
          bare
          options={PROPERTY_TRANSACTION_OPTIONS.map((option) => option.label)}
          value={
            PROPERTY_TRANSACTION_OPTIONS.find(
              (option) => option.id === values.propertyTransaction,
            )?.label ?? ""
          }
          onChange={(label) => {
            const match = PROPERTY_TRANSACTION_OPTIONS.find(
              (option) => option.label === label,
            );
            onChange("propertyTransaction", match?.id ?? "");
          }}
        />

        {values.propertyTransaction === "new" ? (
          <div className="mt-5">
            <ChipSelectField
              legend="Construction Status"
              required
              bare
              options={CONSTRUCTION_STATUS_OPTIONS.map((option) => option.label)}
              value={
                CONSTRUCTION_STATUS_OPTIONS.find(
                  (option) => option.id === values.constructionStatus,
                )?.label ?? ""
              }
              onChange={(label) => {
                const match = CONSTRUCTION_STATUS_OPTIONS.find(
                  (option) => option.label === label,
                );
                onChange(
                  "constructionStatus",
                  (match?.id ?? "") as ConstructionStatusId | "",
                );
              }}
            />
          </div>
        ) : null}

        {values.propertyTransaction === "resale" ? (
          <div className="mt-5">
            <ChipSelectField
              legend="Age of Construction"
              required
              bare
              options={AGE_OF_CONSTRUCTION_OPTIONS.map((option) => option.label)}
              value={
                AGE_OF_CONSTRUCTION_OPTIONS.find(
                  (option) => option.id === values.ageOfConstruction,
                )?.label ?? ""
              }
              onChange={(label) => {
                const match = AGE_OF_CONSTRUCTION_OPTIONS.find(
                  (option) => option.label === label,
                );
                onChange(
                  "ageOfConstruction",
                  (match?.id ?? "") as AgeOfConstructionId | "",
                );
              }}
            />
          </div>
        ) : null}
      </PostPropertyFieldSection>

      {values.propertyTransaction === "new" ? (
        <PostPropertyFieldSection title="Possession Date" required>
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            <FloatingInput
              id="possessionDate"
              label="Possession Date (Month - Year)*"
              placeholder="Possession Date"
              variant="underline"
              type="month"
              staticLabel
              value={values.possessionDate}
              onChange={(value) => onChange("possessionDate", value)}
            />
          </div>
        </PostPropertyFieldSection>
      ) : null}

      <ChipSelectField
        legend="Bedrooms"
        required
        options={["1", "2", "3", "4", "5", "6", "7"]}
        value={values.bedrooms}
        onChange={(value) => onChange("bedrooms", value)}
        moreOptions={["8", "9", "10"]}
      />

      <ChipSelectField
        legend="Balcony"
        required
        options={["0", "1", "2", "3", "4", "5", "6"]}
        value={values.balcony}
        onChange={(value) => onChange("balcony", value)}
        moreOptions={["7", "8", "9", "10"]}
      />

      <ChipSelectField
        legend="Total Floors"
        required
        options={["1", "2", "3", "4", "5", "6", "7"]}
        value={values.totalFloors}
        onChange={(value) => onChange("totalFloors", value)}
        moreOptions={[
          "8",
          "9",
          "10",
          "11",
          "12",
          "13",
          "14",
          "15",
          "16",
          "17",
          "18",
          "19",
          "20",
          "21",
          "22",
          "23",
          "24",
          "25",
          "26",
          "27",
          "28",
          "29",
          "30",
          "31",
          "32",
          "33",
          "34",
          "35",
          "36",
          "37",
          "38",
          "39",
          "40",
          "41",
          "42",
          "43",
          "44",
          "45",
          "46",
          "47",
          "48",
          "49",
          "50",
          "51",
          "52",
          "53",
          "54",
          "55",
          "56",
          "57",
          "58",
          "59",
          "60",
          "61",
          "62",
          "63",
          "64",
          "65",
          "66",
          "67",
          "68",
          "69",
          "70",
          "71",
          "72",
          "73",
          "74",
          "75",
          "76",
          "77",
          "78",
          "79",
          "80",
          "81",
          "82",
          "83",
          "84",
          "85",
          "86",
          "87",
          "88",
          "89",
          "90",
          "91",
          "92",
          "93",
          "94",
          "95",
          "96",
          "97",
          "98",
          "99",
          "100"
        ]}
      />

      {floorNumberOptions.length > 0 ? (
        <ChipSelectField
          legend="Floor number"
          required
          options={floorNumberOptions}
          value={values.floorNumber}
          onChange={(value) => onChange("floorNumber", value)}
          moreOptions={floorNumberMoreOptions}
        />
      ) : null}

      <ChipSelectField
        legend="Bathrooms"
        required
        options={["1", "2", "3", "4", "5", "6", "7"]}
        value={values.bathrooms}
        onChange={(value) => onChange("bathrooms", value)}
      />

      <ChipSelectField
        legend="Lift"
        options={["0", "1", "2", "3", "4", "5", "6"]}
        value={values.lift}
        onChange={(value) => onChange("lift", value)}
        moreOptions={["7", "8", "9", "10"]}
      />
    </div>
  );
}
