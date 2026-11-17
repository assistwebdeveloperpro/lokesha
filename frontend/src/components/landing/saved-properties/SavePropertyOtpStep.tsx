"use client";

import { Loader2, Pencil } from "lucide-react";
import { useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from "react";
import { authOtpDigitClassName } from "@/components/shared/auth/authForm.styles";
import { savePropertySubmitClassName } from "./savePropertyModal.styles";
import { useOtpCountdown } from "./useOtpCountdown";

const OTP_LENGTH = 4;

type SavePropertyOtpStepProps = {
  mobile: string;
  isSubmitting: boolean;
  onSubmit: (otp: string) => Promise<boolean>;
  onResend: () => Promise<boolean>;
  onBack: () => void;
};

const emptyOtp = () => Array<string>(OTP_LENGTH).fill("");

export function SavePropertyOtpStep({
  mobile,
  isSubmitting,
  onSubmit,
  onResend,
  onBack,
}: SavePropertyOtpStepProps) {
  const [otp, setOtp] = useState<string[]>(emptyOtp);
  const [isResending, setIsResending] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { secondsLeft, isExpired, restart } = useOtpCountdown();
  const isComplete = otp.every(Boolean);

  const updateDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setOtp((prev) => prev.map((current, i) => (i === index ? digit : current)));
    if (digit && index < OTP_LENGTH - 1) otpRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    setOtp(Array.from({ length: OTP_LENGTH }, (_, i) => pasted[i] ?? ""));
    otpRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const resetDigits = () => {
    setOtp(emptyOtp());
    otpRefs.current[0]?.focus();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isComplete) return;

    const isVerified = await onSubmit(otp.join(""));
    if (!isVerified) resetDigits();
  };

  const handleResend = async () => {
    setIsResending(true);
    const isSent = await onResend();
    setIsResending(false);
    if (!isSent) return;

    resetDigits();
    restart();
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
        <span className="text-sm font-semibold text-slate-800">+91 {mobile}</span>
        <button
          type="button"
          onClick={onBack}
          aria-label="Change phone number"
          className="inline-flex cursor-pointer items-center text-slate-500 transition hover:text-navy-blue"
        >
          <Pencil className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="flex justify-center gap-2.5 sm:gap-3" onPaste={handlePaste}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              otpRefs.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            autoFocus={index === 0}
            maxLength={1}
            value={digit}
            aria-label={`Digit ${index + 1} of verification code`}
            onChange={(event) => updateDigit(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            className={authOtpDigitClassName(false)}
          />
        ))}
      </div>

      <div className="flex min-h-7 items-center justify-center text-sm">
        {isExpired ? (
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="inline-flex cursor-pointer items-center gap-1.5 font-semibold text-navy-blue underline underline-offset-4 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isResending ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
            Resend OTP
          </button>
        ) : (
          <span
            aria-live="polite"
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
          >
            Resend OTP available in {secondsLeft} s
          </span>
        )}
      </div>

      <button type="submit" disabled={isSubmitting || !isComplete} className={savePropertySubmitClassName}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        {isSubmitting ? "Verifying..." : "Submit"}
      </button>
      <button
        type="button"
        onClick={onBack}
        className="w-full cursor-pointer text-center text-sm font-medium text-slate-600 underline decoration-slate-400 underline-offset-4 transition hover:text-navy-blue hover:decoration-navy-blue"
      >
        Back to login
      </button>
    </form>
  );
}
