import PostPropertyInput from "../components/PostPropertyInput";
import PostPropertyFieldSection from "../components/PostPropertyFieldSection";
import type {
  OwnerContactFieldErrors,
  OwnerContactValues,
} from "../config/postPropertyForm.shared";

const MOBILE_LENGTH = 10;

const toDigits = (value: string) => value.replace(/\D/g, "").slice(0, MOBILE_LENGTH);

export default function OwnerContactField({
  values,
  onChange,
  errors = {},
}: {
  values: OwnerContactValues;
  onChange: (field: keyof OwnerContactValues, value: string) => void;
  errors?: OwnerContactFieldErrors;
}) {
  return (
    <PostPropertyFieldSection
      title="Property Owner Information"
      description="Enter the actual property owner's contact information."
    >
      <div className="space-y-5 md:space-y-6">
        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          <PostPropertyInput
            id="ownerFullName"
            label="Full Name (Name, Surname)*"
            variant="underline"
            prominentLabel
            compactProminentLabel
            value={values.fullName}
            error={errors.fullName}
            onChange={(value) => onChange("fullName", value)}
          />
          <PostPropertyInput
            id="ownerMobileNumber"
            label="Mobile Number*"
            type="tel"
            variant="underline"
            prominentLabel
            compactProminentLabel
            value={values.mobileNumber}
            error={errors.mobileNumber}
            onChange={(value) => onChange("mobileNumber", toDigits(value))}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          <PostPropertyInput
            id="ownerAlternateMobileNumber"
            label="Alternate Mobile Number"
            type="tel"
            variant="underline"
            prominentLabel
            compactProminentLabel
            value={values.alternateMobileNumber}
            error={errors.alternateMobileNumber}
            onChange={(value) => onChange("alternateMobileNumber", toDigits(value))}
          />
          <PostPropertyInput
            id="ownerWhatsappNumber"
            label="WhatsApp Number"
            type="tel"
            variant="underline"
            prominentLabel
            compactProminentLabel
            value={values.whatsappNumber}
            error={errors.whatsappNumber}
            onChange={(value) => onChange("whatsappNumber", toDigits(value))}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          <PostPropertyInput
            id="ownerEmail"
            label="Email Address"
            type="email"
            variant="underline"
            prominentLabel
            compactProminentLabel
            value={values.email}
            error={errors.email}
            onChange={(value) => onChange("email", value)}
          />
        </div>
      </div>
    </PostPropertyFieldSection>
  );
}
