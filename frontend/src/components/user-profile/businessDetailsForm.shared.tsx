import {
  Building,
  Building2,
  FileText,
  HardHat,
  Home,
  Key,
  Layers,
  MoreHorizontal,
  Store,
  Tag,
  TreePine,
} from "lucide-react";

export const dealingInOptions = [
  { id: "sale", label: "Sale", icon: Tag },
  { id: "rent", label: "Rent", icon: Key },
] as const;

export const propertyTypeOptions = [
  { id: "residential", label: "Residential", icon: Home },
  { id: "commercial", label: "Commercial", icon: Building2 },
] as const;

export const transactionTypeOthersOptions = [
  { id: "original-booking", label: "Original Booking" },
  { id: "resale", label: "Resale" },
  { id: "others", label: "Others" },
] as const;

export const transactionTypeOptions = [
  { id: "rent-lease", label: "Rent/Lease", icon: FileText },
  { id: "pre-launch", label: "Pre-launch", icon: HardHat },
  {
    id: "others",
    label: "Others",
    icon: Building2,
    hasDropdown: true,
    dropdownOptions: [...transactionTypeOthersOptions],
  },
] as const;

export const residentialPropertyOthersOptions = [
  { id: "residential-plot", label: "Residential Plot" },
  { id: "penthouse", label: "Penthouse" },
  { id: "studio-apartment", label: "Studio Apartment" },
  { id: "paying-Guest", label: "Paying Guest" },
  { id: "hostel", label: "Hostel" },
] as const;

export const residentialPropertyOptions = [
  { id: "multistorey-apartment", label: "Multistorey Apartment", icon: Building },
  { id: "builder-floor-apartment", label: "Builder Floor Apartment", icon: Layers },
  { id: "residential-house", label: "Residential House", icon: Home },
  { id: "villa", label: "Villa", icon: TreePine },
  {
    id: "others",
    label: "Others",
    icon: Store,
    hasDropdown: true,
    dropdownOptions: [...residentialPropertyOthersOptions],
  },
] as const;

export const commercialPropertyOthersOptions = [
  { id: "warehouse", label: "Warehouse" },
  { id: "industrial-shed", label: "Industrial Shed" },
  { id: "co-working-space", label: "Co-working Space" },
] as const;

export const commercialPropertyOptions = [
  { id: "commercial-land", label: "Commercial Land", icon: TreePine },
  { id: "commercial-office-space", label: "Commercial Office Space", icon: Building2 },
  { id: "commercial-shop", label: "Commercial Shop", icon: Store },
  { id: "commercial-showroom", label: "Commercial Showroom", icon: Building },
  {
    id: "others",
    label: "Others",
    icon: MoreHorizontal,
    hasDropdown: true,
    dropdownOptions: [...commercialPropertyOthersOptions],
  },
] as const;

export const operatingSinceYears = [
  { value: "", label: "Select year" },
  ...Array.from({ length: 47 }, (_, index) => {
    const year = String(2026 - index);
    return { value: year, label: year };
  }),
];

export const expertiseOptions = [
  { value: "", label: "Select expertise" },
  { value: "Residential Sales", label: "Residential Sales" },
  { value: "Commercial Sales", label: "Commercial Sales" },
  { value: "Property Management", label: "Property Management" },
  { value: "Rental Services", label: "Rental Services" },
  { value: "Land & Plot", label: "Land & Plot" },
  { value: "Luxury Properties", label: "Luxury Properties" },
];

export type ClientRow = {
  id: string;
  name: string;
  dealValue: string;
};

export type YesNoField = "propertyRegistry" | "loanFacility";

export const DEALING_IN_FIELD_ERROR = "Dealing is required.";
export const PROPERTY_TYPE_FIELD_ERROR = "Property type is required.";
export const TRANSACTION_TYPE_FIELD_ERROR = "Transaction type is required.";
export const RESIDENTIAL_PROPERTY_FIELD_ERROR = "Residential property is required.";
export const COMMERCIAL_PROPERTY_FIELD_ERROR = "Commercial property is required.";
export const OPERATING_SINCE_FIELD_ERROR = "Operating since is required.";
export const EXPERTISE_IN_FIELD_ERROR = "Expertise in is required.";
export const BUSINESS_DESCRIPTION_REQUIRED_ERROR = "Business description is required.";
export const BUSINESS_DESCRIPTION_MIN_LENGTH_ERROR =
  "Business description must be at least 100 characters.";
export const BUSINESS_DESCRIPTION_MIN_LENGTH = 100;

export type FormErrors = {
  dealingIn?: string;
  propertyType?: string;
  transactionType?: string;
  residentialProperty?: string;
  commercialProperty?: string;
  operatingSince?: string;
  expertiseIn?: string;
  businessDescription?: string;
};

export function FloatingTextarea({
  id,
  label,
  value,
  onChange,
  maxLength = 3000,
  error,
  prominentLabel = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  error?: string;
  prominentLabel?: boolean;
}) {
  const hasError = Boolean(error);

  return (
    <div>
      <label
        htmlFor={id}
        className={`mb-2.5 block font-semibold ${
          prominentLabel ? "text-base text-slate-800" : "text-sm text-slate-700"
        }`}
      >
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        maxLength={maxLength}
        rows={3}
        aria-invalid={hasError}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full resize-y border-0 border-b bg-transparent px-0 pb-2.5 pt-2 text-sm font-medium leading-relaxed text-slate-900 outline-none transition-colors ${
          hasError ? "border-red-500 focus:border-red-500" : "border-slate-300 focus:border-sky-600"
        }`}
      />
      <p className="mt-1 text-right text-xs text-slate-400">
        {value.length}/{maxLength}
      </p>
      {error && (
        <p className="mt-1 text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function YesNoRadioGroup({
  legend,
  name,
  value,
  onChange,
  error,
}: {
  legend: string;
  name: YesNoField;
  value: "yes" | "no" | "";
  onChange: (value: "yes" | "no") => void;
  error?: string;
}) {
  const hasError = Boolean(error);

  return (
    <fieldset aria-invalid={hasError}>
      <legend className="mb-2.5 text-sm font-semibold text-slate-700">{legend}</legend>
      <div className="flex items-center gap-6">
        {(["yes", "no"] as const).map((option) => (
          <label
            key={option}
            className="flex cursor-pointer items-center gap-2 text-sm capitalize text-slate-600"
          >
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className={`h-4 w-4 text-sky-600 focus:ring-sky-500 ${
                hasError ? "border-red-500" : "border-slate-300"
              }`}
            />
            {option}
          </label>
        ))}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}

/**
 * The backend merges tile selections and "others" dropdown checkboxes into a single
 * deduped column (see user-company.service.js mergeUnique). This splits a merged
 * array back into tile ids vs dropdown-others ids for prefilling the edit form.
 * Note: the "others" tile id and the "others" dropdown-option id are the same
 * literal string, so if present, both are reported as selected — that ambiguity is
 * inherent to how the values are merged/deduped server-side.
 */
export function splitMergedSelections<TileId extends string>(
  merged: string[] | null | undefined,
  tileOptionIds: readonly TileId[],
  othersOptionIds: readonly string[],
): { tileSelections: TileId[]; othersSelections: string[] } {
  const values = merged ?? [];
  const tileSelections = values.filter((value): value is TileId =>
    (tileOptionIds as readonly string[]).includes(value),
  );
  const othersSelections = values.filter((value) => othersOptionIds.includes(value));
  return { tileSelections, othersSelections };
}
