"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import FloatingInput from "./FloatingInput";
import MathCaptcha, { type MathCaptchaHandle } from "./MathCaptcha";
import VerifyForm from "./VerifyForm";
import { login } from "@/services/auth.service";
import { useToast } from "@/components/ui/ToastProvider";

const roles = [
  { id: "buyer", label: "Buyer" },
  { id: "owner", label: "Owner" },
  { id: "agent", label: "Agent" },
  { id: "builder", label: "Builder" },
] as const;

export default function LoginContent() {
  const { showToast } = useToast();
  const mathCaptchaRef = useRef<MathCaptchaHandle>(null);
  const [role, setRole] = useState<(typeof roles)[number]["id"]>("buyer");
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
    const response = await login({ role, mobile_number: mobileDigits });
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
      showToast(
        "This mobile number isn't registered with us yet. Please sign up first.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-lg px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-0 xl:px-10">
      <div className="w-full overflow-hidden rounded-2xl border border-white/80 bg-white/95 shadow-xl shadow-slate-900/5 backdrop-blur-sm">
        <div className="p-4 sm:p-5 lg:p-6">
              {step === "login" ? (
                <>
                  <h1 className="font-display text-2xl font-bold text-slate-800">Login</h1>

                  <form className="mt-4 space-y-4 sm:mt-5 sm:space-y-5" onSubmit={handleLoginNext}>
                    <fieldset>
                      <legend className="mb-3 text-sm font-semibold text-slate-700">
                        Are you
                      </legend>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                        {roles.map((item) => {
                          const isActive = role === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setRole(item.id)}
                              className={`rounded-full border-2 px-3 py-2.5 text-sm font-semibold transition-all sm:px-4 hover:cursor-pointer ${
                                isActive
                                  ? "border-lokesha-teal text-lokesha-teal bg-lokesha-teal/5 shadow-sm"
                                  : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                              }`}
                            >
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>

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
                      className="bg-linear-to-r-navy-blue w-full cursor-pointer rounded-xl py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-slate-900/25 transition hover:shadow-slate-900/35 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting ? "Please wait..." : "Next"}
                    </button>

                    <div className="text-right">
                      <Link
                        href="/help"
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
          <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 text-center sm:px-5 lg:px-6">
            <p className="text-sm text-slate-600">
              New to Lokesha?{" "}
              <Link
                href="/signup"
                className="font-semibold text-sky-700 transition-colors hover:text-sky-600"
              >
                Sign Up
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
