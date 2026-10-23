"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import FloatingInput from "@/components/shared/FloatingInput";
import {
  authFormBodyClassName,
  authFormCardClassName,
  authFormFieldsClassName,
  authFormFooterClassName,
  authFormInlineLinkClassName,
  authFormSubmitClassName,
} from "@/components/shared/auth/authForm.styles";
import AuthFormHeading from "@/components/shared/auth/AuthFormHeading";
import MathCaptcha, { type MathCaptchaHandle } from "@/components/shared/auth/MathCaptcha";
import VerifyForm from "./VerifyForm";
import { validateWithSchema } from "@/lib/validation/joi";
import { loginSchema } from "@/lib/validation/schemas/auth.schema";
import { login } from "@/services/auth.service";
import { useToast } from "@/components/shared/ui/ToastProvider";

export default function LoginContent() {
  const { showToast } = useToast();
  const mathCaptchaRef = useRef<MathCaptchaHandle>(null);
  const [step, setStep] = useState<"login" | "verify">("login");
  const [mobile, setMobile] = useState("");
  const [mathAnswer, setMathAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpExpiresIn, setOtpExpiresIn] = useState(300);
  const [errors, setErrors] = useState<{
    mobile?: string;
    mathAnswer?: string;
  }>({});

  const requestOtp = async (mobileDigits: string) => {
    const response = await login({ mobile_number: mobileDigits });
    setOtpExpiresIn(response.otp_expires_in);
    showToast("OTP sent successfully.");
    return response.otp_expires_in;
  };

  const handleLoginNext = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: typeof errors = {};
    const mobileDigits = mobile.replace(/\D/g, "");
    const { errors: schemaErrors } = validateWithSchema(loginSchema, {
      mobile_number: mobileDigits,
    });
    if (schemaErrors.mobile_number) {
      nextErrors.mobile = schemaErrors.mobile_number;
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
      await requestOtp(mobileDigits);
      setStep("verify");
    } catch {
      showToast(
        "This mobile number isn't registered with us yet. Please sign up first.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div className={authFormCardClassName}>
        <div className={authFormBodyClassName}>
              {step === "login" ? (
                <>
                  <AuthFormHeading
                    title="Login"
                    description="Enter your registered mobile number to receive a one-time password."
                  />

                  <form className={authFormFieldsClassName} onSubmit={handleLoginNext}>
                    <FloatingInput
                      id="mobile"
                      label="Enter Mobile No."
                      type="tel"
                      variant="underline"
                      value={mobile}
                      onChange={(value) => {
                        setMobile(value);
                        if (errors.mobile) {
                          setErrors((prev) => ({ ...prev, mobile: undefined }));
                        }
                      }}
                      error={errors.mobile}
                    />

                    <MathCaptcha
                      ref={mathCaptchaRef}
                      id="login-math-answer"
                      value={mathAnswer}
                      onChange={setMathAnswer}
                      error={errors.mathAnswer}
                      onClearError={() => {
                        if (errors.mathAnswer) {
                          setErrors((prev) => ({ ...prev, mathAnswer: undefined }));
                        }
                      }}
                    />

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={authFormSubmitClassName}
                    >
                      {isSubmitting ? "Please wait..." : "Next"}
                    </button>

                    <div className="text-right">
                      <Link
                        href="#"
                        className="text-sm text-slate-500 transition-colors hover:text-sky-700"
                      >
                        Need help?
                      </Link>
                    </div>
                  </form>
                </>
              ) : (
                <VerifyForm
                  mobile={mobile}
                  resendSeconds={otpExpiresIn}
                  onBack={() => setStep("login")}
                  onResend={() => requestOtp(mobile.replace(/\D/g, ""))}
                />
              )}
            </div>

        {step === "login" && (
          <div className={authFormFooterClassName}>
            <p className="text-sm leading-relaxed text-slate-600">
              New to Lokesha?{" "}
              <Link href="/signup" className={authFormInlineLinkClassName}>
                Sign Up
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
