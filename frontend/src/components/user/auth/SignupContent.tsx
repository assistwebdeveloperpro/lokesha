"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import FloatingInput from "@/components/shared/FloatingInput";
import AuthFormBackLink from "@/components/shared/auth/AuthFormBackLink";
import {
  authFormBodyClassName,
  authFormCardClassName,
  authFormFieldsClassName,
  authFormInlineLinkClassName,
  authFormSubmitClassName,
} from "@/components/shared/auth/authForm.styles";
import AuthFormHeading from "@/components/shared/auth/AuthFormHeading";
import MathCaptcha, { type MathCaptchaHandle } from "@/components/shared/auth/MathCaptcha";
import { validateWithSchema } from "@/lib/validation/joi";
import { signupSchema } from "@/lib/validation/schemas/auth.schema";
import { ApiError } from "@/services/apiClient";
import { signup } from "@/services/auth.service";
import { setRedirectToast } from "@/components/shared/ui/redirectToast";
import { useToast } from "@/components/shared/ui/ToastProvider";

const userTypes = [
  { id: "buyer_owner_tenant", label: "Buyer/Owner/Tenant" },
  { id: "agent", label: "Agent" },
  { id: "builder", label: "Builder" },
] as const;

const SCHEMA_FIELD_TO_ERROR_KEY = {
  name: "name",
  agency_name: "agencyName",
  company_name: "companyName",
  email: "email",
  mobile_number: "mobile",
  agreed_to_terms: "terms",
} as const;

const requiredLabel = (text: string) => (
  <>
    {text} <span className="text-red-500">*</span>
  </>
);

export default function SignupContent() {
  const router = useRouter();
  const { showToast } = useToast();
  const mathCaptchaRef = useRef<MathCaptchaHandle>(null);
  const [userType, setUserType] =
    useState<(typeof userTypes)[number]["id"]>("buyer_owner_tenant");
  const [name, setName] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [mathAnswer, setMathAnswer] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();
  const [errors, setErrors] = useState<{
    name?: string;
    agencyName?: string;
    companyName?: string;
    email?: string;
    mobile?: string;
    terms?: string;
    mathAnswer?: string;
  }>({});

  const clearError = (field: keyof typeof errors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(undefined);
    let showErrorToast = true;

    const mobileDigits = mobile.replace(/\D/g, "");
    const { errors: schemaErrors } = validateWithSchema(signupSchema, {
      role: userType,
      name,
      email,
      mobile_number: mobileDigits,
      agreed_to_terms: agreedToTerms,
      ...(userType === "agent" && { agency_name: agencyName }),
      ...(userType === "builder" && { company_name: companyName }),
    });

    const nextErrors: typeof errors = {};
    for (const [schemaField, field] of Object.entries(SCHEMA_FIELD_TO_ERROR_KEY)) {
      if (schemaErrors[schemaField]) {
        nextErrors[field] = schemaErrors[schemaField];
      }
    }
    if (!mathAnswer.trim()) {
      nextErrors.mathAnswer = "Please enter the answer.";
    } else if (!mathCaptchaRef.current?.validate(mathAnswer)) {
      nextErrors.mathAnswer = "Incorrect answer. Please try again.";
      mathCaptchaRef.current?.refresh();
      setMathAnswer("");
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await signup({
        role: userType,
        name: name.trim(),
        ...(userType === "agent" && { agency_name: agencyName.trim() }),
        ...(userType === "builder" && { company_name: companyName.trim() }),
        email: email.trim(),
        mobile_number: mobileDigits,
        agreed_to_terms: agreedToTerms,
      });
      setRedirectToast("Registered successfully! Please login to continue.");
      router.push("/login");
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        if (error.message.toLowerCase().includes("email")) {
          setErrors((prev) => ({ ...prev, email: error.message }));
          showErrorToast = false;
        } else if (error.message.toLowerCase().includes("mobile")) {
          setErrors((prev) => ({ ...prev, mobile: error.message }));
          showErrorToast = false;
        } else {
          setFormError(error.message);
        }
      } else if (error instanceof ApiError && error.status === 400 && error.fields) {
        const { name, agency_name, company_name, email, mobile_number, ...rest } =
          error.fields;
        const fieldErrors = {
          name,
          agencyName: agency_name,
          companyName: company_name,
          email,
          mobile: mobile_number,
        };
        setErrors((prev) => ({ ...prev, ...fieldErrors }));

        // Anything not tied to a visible field stays as a general error
        const unmapped = Object.values(rest);
        if (unmapped.length > 0) {
          setFormError(unmapped.join(" "));
        } else {
          showErrorToast = false;
        }
      } else if (error instanceof ApiError) {
        setFormError(error.errors?.join(" ") ?? error.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
      if (showErrorToast) {
        showToast(
          error instanceof ApiError ? error.message : "Registration failed. Please try again.",
          "error",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-lg">
          <div className={authFormCardClassName}>
            <div className={authFormBodyClassName}>
            <AuthFormBackLink href="/login" />
            <AuthFormHeading
              title="Sign up"
              description="Create your account in minutes and start listing or discovering properties."
            />

            <form className={authFormFieldsClassName} onSubmit={handleSignupSubmit}>
              <fieldset>
                <legend className="mb-2.5 text-sm font-semibold text-slate-800">
                  I am
                </legend>
                <div className="flex flex-col gap-2.5 max-[400px]:gap-2 sm:flex-row sm:flex-wrap sm:gap-x-5 sm:gap-y-2">
                  {userTypes.map((type) => (
                    <label
                      key={type.id}
                      className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700"
                    >
                      <input
                        type="radio"
                        name="userType"
                        value={type.id}
                        checked={userType === type.id}
                        onChange={() => setUserType(type.id)}
                        className="h-4 w-4 shrink-0 border-slate-300 text-sky-600 focus:ring-2 focus:ring-sky-500/30"
                      />
                      {type.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <FloatingInput
                id="name"
                label={requiredLabel("Name")}
                variant="underline"
                value={name}
                onChange={(value) => {
                  setName(value);
                  clearError("name");
                }}
                error={errors.name}
              />

              {userType === "agent" && (
                <FloatingInput
                  id="agencyName"
                  label={requiredLabel("Agency Name")}
                  variant="underline"
                  value={agencyName}
                  onChange={(value) => {
                    setAgencyName(value);
                    clearError("agencyName");
                  }}
                  error={errors.agencyName}
                />
              )}

              {userType === "builder" && (
                <FloatingInput
                  id="companyName"
                  label={requiredLabel("Company Name")}
                  variant="underline"
                  value={companyName}
                  onChange={(value) => {
                    setCompanyName(value);
                    clearError("companyName");
                  }}
                  error={errors.companyName}
                />
              )}

              <FloatingInput
                id="email"
                label={requiredLabel("Email")}
                type="email"
                variant="underline"
                value={email}
                onChange={(value) => {
                  setEmail(value);
                  clearError("email");
                }}
                error={errors.email}
              />

              <div>
                <FloatingInput
                  id="mobile"
                  label={requiredLabel("Mobile Number")}
                  type="tel"
                  variant="underline"
                  value={mobile}
                  invalid={Boolean(errors.mobile)}
                  onChange={(value) => {
                    setMobile(value.replace(/\D/g, "").slice(0, 10));
                    clearError("mobile");
                  }}
                />
                {errors.mobile && (
                  <p className="mt-1 text-sm text-red-500" role="alert">
                    {errors.mobile}
                  </p>
                )}
              </div>

              <div>
                <label className="flex cursor-pointer items-start gap-2.5 text-sm leading-relaxed text-slate-600">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => {
                      setAgreedToTerms(e.target.checked);
                      clearError("terms");
                    }}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span>
                    I agree to Lokesha{" "}
                    <Link href="#" className="font-medium text-sky-700 hover:text-sky-600">
                      T&amp;C
                    </Link>
                    ,{" "}
                    <Link href="#" className="font-medium text-sky-700 hover:text-sky-600">
                      Privacy Policy
                    </Link>
                    , &amp;{" "}
                    <Link href="#" className="font-medium text-sky-700 hover:text-sky-600">
                      Cookie Policy
                    </Link>
                  </span>
                </label>
                {errors.terms && (
                  <p className="mt-1 text-sm text-red-500" role="alert">
                    {errors.terms}
                  </p>
                )}
              </div>

              <MathCaptcha
                ref={mathCaptchaRef}
                id="signup-math-answer"
                value={mathAnswer}
                onChange={setMathAnswer}
                error={errors.mathAnswer}
                onClearError={() => clearError("mathAnswer")}
              />

              {formError && (
                <p className="text-center text-sm text-red-500" role="alert">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={authFormSubmitClassName}
              >
                {isSubmitting ? "Signing Up..." : "Sign Up"}
              </button>
            </form>

            <p className="mt-5 border-t border-slate-100 pt-4 text-center text-sm leading-relaxed text-slate-600">
              Already registered?{" "}
              <Link href="/login" className={authFormInlineLinkClassName}>
                Login Now
              </Link>
            </p>
            </div>
          </div>
    </div>
  );
}
