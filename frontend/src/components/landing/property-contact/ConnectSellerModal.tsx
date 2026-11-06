"use client";

import { Loader2, X } from "lucide-react";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useToast } from "@/components/shared/ui/ToastProvider";
import { ApiError } from "@/services/apiClient";
import { connectSeller, verifyOtp } from "@/services/auth.service";
import { setSession } from "@/services/session";

const OTP_LENGTH = 4;
const MOBILE_PATTERN = /^[0-9]{10}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClassName =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-navy-blue focus:ring-2 focus:ring-navy-blue/15";

type ConnectSellerModalProps = {
  onClose: () => void;
  onVerified: (token: string) => void;
};

type FormValues = {
  name: string;
  email: string;
  mobile: string;
  agreed: boolean;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) return error.errors?.[0] ?? error.message;
  return fallback;
}

function validate({ name, email, mobile, agreed }: FormValues) {
  if (name.trim().length < 3) return "Name must be at least 3 characters long.";
  if (!EMAIL_PATTERN.test(email.trim())) return "Please enter a valid email id.";
  if (!MOBILE_PATTERN.test(mobile)) return "Mobile number must be exactly 10 digits.";
  if (!agreed) return "Please agree to the Terms of use and allow WhatsApp.";
  return null;
}

export function ConnectSellerModal({ onClose, onVerified }: ConnectSellerModalProps) {
  const headingId = useId();
  const { showToast } = useToast();
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<FormValues>({ name: "", email: "", mobile: "", agreed: false });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"details" | "otp">("details");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstFieldRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const sendOtp = async () => {
    await connectSeller({
      name: values.name.trim(),
      email: values.email.trim(),
      mobile_number: values.mobile,
      agreed_to_terms: values.agreed,
    });
    setStep("otp");
  };

  const handleDetailsSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const validationError = validate(values);
    if (validationError) {
      showToast(validationError, "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await sendOtp();
      showToast("OTP sent successfully.");
    } catch (error) {
      showToast(getErrorMessage(error, "Unable to send OTP. Please try again."), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (otp.length !== OTP_LENGTH) {
      showToast("Please enter the verification code.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const { token, role } = await verifyOtp({ mobile_number: values.mobile, otp });
      setSession(token, role);
      onVerified(token);
    } catch {
      showToast("OTP is not verified. Please try again.", "error");
      setIsSubmitting(false);
    }
  };

  const setField = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Close connect to seller dialog backdrop"
        className="absolute inset-0 cursor-pointer bg-slate-900/55 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xl shadow-slate-900/15 sm:p-7"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-500 transition hover:text-slate-700"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>

        <h2 id={headingId} className="font-display text-xl font-bold tracking-tight text-slate-900">
          Connect to Seller
        </h2>
        <p className="mt-1.5 text-sm text-slate-600">
          {step === "details"
            ? "Share your details and verify with OTP to contact the seller."
            : `Enter the 4-digit code sent to ${values.mobile}.`}
        </p>

        {step === "details" ? (
          <form className="mt-5 space-y-3.5" onSubmit={handleDetailsSubmit} noValidate>
            <input
              ref={firstFieldRef}
              type="text"
              autoComplete="name"
              placeholder="Full name"
              aria-label="Full name"
              value={values.name}
              onChange={(e) => setField("name", e.target.value)}
              className={inputClassName}
            />
            <input
              type="email"
              autoComplete="email"
              placeholder="Email id"
              aria-label="Email id"
              value={values.email}
              onChange={(e) => setField("email", e.target.value)}
              className={inputClassName}
            />
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="Mobile number"
              aria-label="Mobile number"
              maxLength={10}
              value={values.mobile}
              onChange={(e) => setField("mobile", e.target.value.replace(/\D/g, ""))}
              className={inputClassName}
            />
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-3 text-[13px] leading-5 text-slate-600 transition hover:border-navy-blue/40 has-checked:border-navy-blue/50 has-checked:bg-navy-blue/5">
              <input
                type="checkbox"
                checked={values.agreed}
                onChange={(e) => setField("agreed", e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-navy-blue"
              />
              <span>
                I Agree to <span className="font-semibold text-navy-blue">AddressBox&apos;s Terms of use</span> and{" "}
                <span className="font-semibold text-slate-900">Allow Whatsapp</span>
              </span>
            </label>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-r-navy-blue px-5 text-sm font-semibold text-white shadow-md transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              {isSubmitting ? "Sending OTP..." : "Login"}
            </button>
          </form>
        ) : (
          <form className="mt-5 space-y-3.5" onSubmit={handleOtpSubmit}>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Enter OTP"
              aria-label="Verification code"
              maxLength={OTP_LENGTH}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className={`${inputClassName} text-center text-lg tracking-[0.5em]`}
              autoFocus
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-r-navy-blue px-5 text-sm font-semibold text-white shadow-md transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              {isSubmitting ? "Verifying..." : "Verify & Connect"}
            </button>
            <button
              type="button"
              onClick={() => setStep("details")}
              className="w-full cursor-pointer text-center text-sm font-medium text-slate-600 transition hover:text-navy-blue"
            >
              Change details
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
