"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import FloatingInput from "@/components/shared/FloatingInput";
import MathCaptcha, { type MathCaptchaHandle } from "./MathCaptcha";
import { ApiError } from "@/services/apiClient";
import { signup } from "@/services/auth.service";
import { useToast } from "@/components/ui/ToastProvider";

const userTypes = [
  { id: "buyer", label: "Buyer" },
  { id: "owner", label: "Owner" },
  { id: "agent", label: "Agent" },
  { id: "builder", label: "Builder" },
] as const;

export default function SignupContent() {
  const router = useRouter();
  const { showToast } = useToast();
  const mathCaptchaRef = useRef<MathCaptchaHandle>(null);
  const [userType, setUserType] = useState<(typeof userTypes)[number]["id"]>("buyer");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [mathAnswer, setMathAnswer] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
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

    const nextErrors: typeof errors = {};
    if (!name.trim()) {
      nextErrors.name = "Please enter your name.";
    }
    if (!email.trim()) {
      nextErrors.email = "Please enter your email id.";
    }
    if (!password.trim()) {
      nextErrors.password = "Please enter password.";
    }
    const mobileDigits = mobile.replace(/\D/g, "");
    if (!mobile.trim()) {
      nextErrors.mobile = "Please enter mobile number.";
    } else if (mobileDigits.length < 10) {
      nextErrors.mobile =
        "Mobile number should be of min. 10 digits. Please re-enter.";
    }
    if (!agreedToTerms) {
      nextErrors.terms = "Please accept the terms and conditions.";
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
        email: email.trim(),
        password,
        mobile_number: mobileDigits,
      });
      showToast("Registered successfully! Please login to continue.");
      router.push("/login");
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        if (error.message.toLowerCase().includes("email")) {
          setErrors((prev) => ({ ...prev, email: error.message }));
        } else if (error.message.toLowerCase().includes("mobile")) {
          setErrors((prev) => ({ ...prev, mobile: error.message }));
        } else {
          setFormError(error.message);
        }
      } else if (error instanceof ApiError) {
        setFormError(error.errors?.join(" ") ?? error.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
      showToast(
        error instanceof ApiError ? error.message : "Registration failed. Please try again.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-lg px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-0 xl:px-10">
          <div className="w-full rounded-2xl border border-white/80 bg-white/95 p-4 shadow-xl shadow-slate-900/5 backdrop-blur-sm sm:p-5 lg:p-6">
            <Link
              href="/login"
              className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-sky-700 lg:mb-3"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              <h1 className="font-display text-2xl font-bold text-slate-800">Sign Up</h1>
            </Link>

            <form className="space-y-4 sm:space-y-5" onSubmit={handleSignupSubmit}>
              <fieldset>
                <legend className="mb-3 text-sm font-semibold text-slate-700">
                  I am
                </legend>
                <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-4">
                  {userTypes.map((type) => (
                    <label
                      key={type.id}
                      className="flex cursor-pointer items-center gap-2 text-sm text-slate-600"
                    >
                      <input
                        type="radio"
                        name="userType"
                        value={type.id}
                        checked={userType === type.id}
                        onChange={() => setUserType(type.id)}
                        className="h-4 w-4 border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                      {type.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <FloatingInput
                id="name"
                label="Name"
                variant="underline"
                value={name}
                onChange={(value) => {
                  setName(value);
                  clearError("name");
                }}
                error={errors.name}
              />

              <FloatingInput
                id="email"
                label="Email"
                type="email"
                variant="underline"
                value={email}
                onChange={(value) => {
                  setEmail(value);
                  clearError("email");
                }}
                error={errors.email}
              />

              <FloatingInput
                id="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                variant="underline"
                value={password}
                onChange={(value) => {
                  setPassword(value);
                  clearError("password");
                }}
                error={errors.password}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-xs font-bold uppercase tracking-wide text-sky-700 hover:text-sky-600"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                }
              />

              <div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-4">
                  <div className="w-full shrink-0 sm:w-32">
                    <FloatingInput
                      id="countryCode"
                      ariaLabel="Country code"
                      variant="underline"
                      defaultValue="+91"
                      invalid={Boolean(errors.mobile)}
                      options={[
                        { value: "+91", label: "IND +91" },
                        { value: "+1", label: "USA +1" },
                        { value: "+44", label: "UK +44" },
                      ]}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <FloatingInput
                      id="mobile"
                      label="Mobile Number"
                      type="tel"
                      variant="underline"
                      value={mobile}
                      invalid={Boolean(errors.mobile)}
                      onChange={(value) => {
                        setMobile(value);
                        clearError("mobile");
                      }}
                    />
                  </div>
                </div>
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
                    <Link href="/terms" className="font-medium text-sky-700 hover:text-sky-600">
                      T&amp;C
                    </Link>
                    ,{" "}
                    <Link href="/privacy" className="font-medium text-sky-700 hover:text-sky-600">
                      Privacy Policy
                    </Link>
                    , &amp;{" "}
                    <Link href="/cookies" className="font-medium text-sky-700 hover:text-sky-600">
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
                className="bg-linear-to-r-navy-blue w-full cursor-pointer rounded-xl py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-slate-900/25 transition hover:shadow-slate-900/35 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Signing Up..." : "Sign Up"}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-slate-600 lg:mt-3">
              Already registered?{" "}
              <Link
                href="/login"
                className="font-semibold text-sky-700 transition-colors hover:text-sky-600"
              >
                Login Now
              </Link>
            </p>
          </div>
    </div>
  );
}
