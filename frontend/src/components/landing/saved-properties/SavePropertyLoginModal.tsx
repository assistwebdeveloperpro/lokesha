"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { useToast } from "@/components/shared/ui/ToastProvider";
import { loadFreeListingsWelcome } from "@/lib/freeListingsWelcome";
import { ApiError } from "@/services/apiClient";
import { registerWithOtp, sendMobileOtp, verifyMobileOtp } from "@/services/auth.service";
import { setSession } from "@/services/session";
import { SAVE_PROPERTY_MESSAGES, SAVE_PROPERTY_MODAL_COPY } from "./savePropertyModal.copy";
import { SavePropertyMobileStep } from "./SavePropertyMobileStep";
import { SavePropertyOtpStep } from "./SavePropertyOtpStep";
import { SavePropertyRegisterStep, type SavePropertyRegisterValues } from "./SavePropertyRegisterStep";

const MOBILE_PATTERN = /^[0-9]{10}$/;

type Step = "mobile" | "otp" | "register";

type SavePropertyLoginModalProps = {
  onClose: () => void;
  onAuthenticated: (token: string) => void;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) return error.errors?.[0] ?? error.message;
  return fallback;
}

export function SavePropertyLoginModal({ onClose, onAuthenticated }: SavePropertyLoginModalProps) {
  const headingId = useId();
  const { showToast } = useToast();
  const [step, setStep] = useState<Step>("mobile");
  const [mobile, setMobile] = useState("");
  const [registrationToken, setRegistrationToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // Resolves true when the OTP was sent
  const requestOtp = async () => {
    if (!MOBILE_PATTERN.test(mobile)) {
      showToast("Mobile number must be exactly 10 digits.", "error");
      return false;
    }

    try {
      await sendMobileOtp({ mobile_number: mobile });
      showToast(SAVE_PROPERTY_MESSAGES.otpSent);
      return true;
    } catch (error) {
      showToast(getErrorMessage(error, SAVE_PROPERTY_MESSAGES.otpSendFailed), "error");
      return false;
    }
  };

  const handleMobileSubmit = async () => {
    setIsSubmitting(true);
    const isSent = await requestOtp();
    setIsSubmitting(false);
    if (isSent) setStep("otp");
  };

  // Resolves true when the code was accepted
  const handleOtpSubmit = async (otp: string) => {
    setIsSubmitting(true);
    try {
      const response = await verifyMobileOtp({ mobile_number: mobile, otp });

      if (response.is_new_user) {
        setRegistrationToken(response.registration_token);
        setStep("register");
        return true;
      }

      setSession(response.token, response.role);
      onAuthenticated(response.token);
      return true;
    } catch (error) {
      showToast(getErrorMessage(error, SAVE_PROPERTY_MESSAGES.otpVerifyFailed), "error");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async ({ name, email, agreed }: SavePropertyRegisterValues) => {
    if (!registrationToken) return;

    setIsSubmitting(true);
    try {
      const { token, role } = await registerWithOtp({
        registration_token: registrationToken,
        name,
        email,
        agreed_to_terms: agreed,
      });
      setSession(token, role);
      onAuthenticated(token);
      void loadFreeListingsWelcome(token).then((message) => {
        if (message) showToast(message);
      });
    } catch (error) {
      showToast(getErrorMessage(error, SAVE_PROPERTY_MESSAGES.registerFailed), "error");
      // An expired registration session needs a fresh OTP
      if (error instanceof ApiError && error.status === 401) {
        setRegistrationToken(null);
        setStep("mobile");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Close login dialog backdrop"
        className="absolute inset-0 cursor-pointer bg-slate-900/55 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="relative max-h-full w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/15"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-500 transition hover:text-slate-700"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>

        <div className="relative aspect-8/3 w-full bg-slate-100">
          <Image
            src={SAVE_PROPERTY_MODAL_COPY.bannerSrc}
            alt={SAVE_PROPERTY_MODAL_COPY.bannerAlt}
            fill
            priority
            sizes="(max-width: 448px) 100vw, 448px"
            className="object-cover"
          />
        </div>

        <div className="p-5 sm:p-7">
          <h2 id={headingId} className="font-display text-xl text-center font-bold tracking-tight text-slate-900">
            {SAVE_PROPERTY_MODAL_COPY.heading}
          </h2>
          <p className="mb-5 mt-3.5 text-sm text-gray-500 text-center">{SAVE_PROPERTY_MODAL_COPY.subText}</p>

          {step === "mobile" ? (
            <SavePropertyMobileStep
              mobile={mobile}
              isSubmitting={isSubmitting}
              onMobileChange={setMobile}
              onSubmit={handleMobileSubmit}
            />
          ) : null}
          {step === "otp" ? (
            <SavePropertyOtpStep
              mobile={mobile}
              isSubmitting={isSubmitting}
              onSubmit={handleOtpSubmit}
              onResend={requestOtp}
              onBack={() => setStep("mobile")}
            />
          ) : null}
          {step === "register" ? (
            <SavePropertyRegisterStep isSubmitting={isSubmitting} onSubmit={handleRegisterSubmit} />
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
