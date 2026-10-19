"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import AuthFormBackLink from "@/components/shared/auth/AuthFormBackLink";
import AuthFormHeading from "@/components/shared/auth/AuthFormHeading";
import { adminVerifyOtp } from "@/services/adminAuth.service";
import { setAdminSession } from "@/services/adminSession";
import { MASTER_DEFAULT_ROUTE } from "@/components/master/layout/master-dashboard-nav";
import { useToast } from "@/components/shared/ui/ToastProvider";

const OTP_LENGTH = 4;

type AdminVerifyFormProps = {
  mobile: string;
  resendSeconds: number;
  onBack: () => void;
  onResend: () => Promise<number>;
};

function formatTimer(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function AdminVerifyForm({
  mobile,
  resendSeconds,
  onBack,
  onResend,
}: AdminVerifyFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState(resendSeconds);
  const [otpError, setOtpError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const updateDigit = useCallback(
    (index: number, value: string) => {
      const digit = value.replace(/\D/g, "").slice(-1);
      setOtp((prev) => {
        const next = [...prev];
        next[index] = digit;
        return next;
      });
      if (otpError) setOtpError(false);
      if (digit && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [otpError],
  );

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const digits = pasted.split("");
    setOtp((prev) => {
      const next = [...prev];
      digits.forEach((d, i) => {
        next[i] = d;
      });
      return next;
    });
    if (otpError) setOtpError(false);
    inputRefs.current[Math.min(digits.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.every((digit) => digit.length > 0)) {
      setOtpError(true);
      showToast("Please enter the verification code.", "error");
      return;
    }
    setOtpError(false);

    setIsSubmitting(true);
    try {
      const { token } = await adminVerifyOtp({
        mobile_number: mobile.replace(/\D/g, ""),
        otp: otp.join(""),
      });
      setAdminSession(token);
      showToast("OTP verified successfully.");
      router.replace(MASTER_DEFAULT_ROUTE);
    } catch {
      setOtpError(true);
      showToast("OTP is not verified. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const nextResendSeconds = await onResend();
      setTimer(nextResendSeconds);
    } catch {
      setTimer(resendSeconds);
    } finally {
      setOtpError(false);
      setIsResending(false);
    }
  };

  const canResend = timer <= 0;

  return (
    <div>
      <AuthFormBackLink onClick={onBack} />
      <AuthFormHeading
        title="Verify OTP"
        description={
          <>
            Enter the 4-digit code sent to{" "}
            <span className="font-semibold text-slate-800">{mobile}</span>.
          </>
        }
      />

      <form className="mt-6 space-y-6 sm:mt-7" onSubmit={handleSubmit}>
        <div className="flex justify-center gap-6 sm:gap-8" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              aria-label={`Digit ${index + 1} of verification code`}
              aria-invalid={otpError}
              onChange={(e) => updateDigit(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`h-10 w-10 border-0 border-b-2 bg-transparent text-center text-lg font-semibold text-slate-800 outline-none transition-colors ${
                otpError
                  ? "border-red-500 focus:border-red-500"
                  : "border-slate-300 focus:border-sky-600"
              }`}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full cursor-pointer rounded-xl bg-linear-to-r-navy-blue py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition hover:bg-[#c62828] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Verifying..." : "Continue"}
        </button>

        <p className="text-center text-sm text-slate-600">
          {canResend ? (
            "You can now resend the verification code"
          ) : (
            <>
              Resend OTP in{" "}
              <span className="font-semibold text-[#d32f2f]">{formatTimer(timer)}</span>
            </>
          )}
        </p>

        <div className="border-t border-slate-100 pt-5 text-center">
          <p className="text-sm text-slate-500">Did not get Verification Code?</p>
          <div className="mt-3 flex items-center justify-center">
            <button
              type="button"
              disabled={!canResend || isResending}
              onClick={handleResend}
              className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
                canResend && !isResending
                  ? "cursor-pointer text-sky-700 hover:text-sky-600"
                  : "cursor-not-allowed text-slate-300"
              }`}
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              {isResending ? "Resending..." : "Resend Code"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
