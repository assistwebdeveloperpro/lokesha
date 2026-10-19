"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import FloatingInput from "@/components/shared/FloatingInput";
import AuthFormHeading from "@/components/shared/auth/AuthFormHeading";
import MathCaptcha, { type MathCaptchaHandle } from "@/components/shared/auth/MathCaptcha";
import AdminVerifyForm from "./AdminVerifyForm";
import { adminLogin } from "@/services/adminAuth.service";
import { getAdminToken } from "@/services/adminSession";
import { MASTER_DEFAULT_ROUTE } from "@/components/master/layout/master-dashboard-nav";
import { useToast } from "@/components/shared/ui/ToastProvider";

export default function AdminLoginContent() {
  const router = useRouter();
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

  useEffect(() => {
    if (getAdminToken()) {
      router.replace(MASTER_DEFAULT_ROUTE);
    }
  }, [router]);

  const requestOtp = async (mobileDigits: string) => {
    const response = await adminLogin({ mobile_number: mobileDigits });
    setOtpExpiresIn(response.otp_expires_in);
    showToast("OTP sent successfully.");
    return response.otp_expires_in;
  };

  const handleLoginNext = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: typeof errors = {};
    const mobileDigits = mobile.replace(/\D/g, "");
    if (!mobile.trim()) {
      nextErrors.mobile = "Please enter your mobile number.";
    } else if (mobileDigits.length < 10) {
      nextErrors.mobile =
        "Mobile number should be of min. 10 digits. Please re-enter.";
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
      showToast("This mobile number is not registered with an admin account. Please check your number and try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="w-full overflow-hidden rounded-xl bg-white shadow-[0_4px_14px_rgba(15,23,42,0.06),0_18px_44px_rgba(15,23,42,0.14)] sm:rounded-2xl">
        <div className="p-3.5 max-[380px]:p-3 sm:p-5 lg:p-6">
          {step === "login" ? (
            <>
              <AuthFormHeading
                title="login"
                description="Enter your registered admin mobile number to continue securely."
              />

              <form className="mt-5 space-y-4 sm:mt-6 sm:space-y-5" onSubmit={handleLoginNext}>
                <FloatingInput
                  id="admin-mobile"
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
                  id="admin-login-math-answer"
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
                  className="bg-navy-blue w-full cursor-pointer rounded-xl py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-slate-900/25 transition hover:opacity-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
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
            <AdminVerifyForm
              mobile={mobile}
              resendSeconds={otpExpiresIn}
              onBack={() => setStep("login")}
              onResend={() => requestOtp(mobile.replace(/\D/g, ""))}
            />
          )}
        </div>
      </div>
    </div>
  );
}
