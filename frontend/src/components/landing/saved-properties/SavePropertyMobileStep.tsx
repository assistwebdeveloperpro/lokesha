"use client";

import { Loader2 } from "lucide-react";
import type { FormEvent } from "react";
import { savePropertyInputClassName, savePropertySubmitClassName } from "./savePropertyModal.styles";

type SavePropertyMobileStepProps = {
  mobile: string;
  isSubmitting: boolean;
  onMobileChange: (value: string) => void;
  onSubmit: () => void;
};

export function SavePropertyMobileStep({
  mobile,
  isSubmitting,
  onMobileChange,
  onSubmit,
}: SavePropertyMobileStepProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="save-property-mobile" className="mb-1.5 block text-sm font-semibold text-slate-800">
          Enter Phone No.
        </label>
        <div className="flex gap-2">
          <span className="inline-flex h-11 shrink-0 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700">
            +91
          </span>
          <input
            id="save-property-mobile"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            autoFocus
            maxLength={10}
            placeholder="10 digit mobile number"
            value={mobile}
            onChange={(event) => onMobileChange(event.target.value.replace(/\D/g, ""))}
            className={savePropertyInputClassName}
          />
        </div>
      </div>
      <button type="submit" disabled={isSubmitting} className={savePropertySubmitClassName}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        {isSubmitting ? "Sending OTP..." : "Send OTP"}
      </button>
    </form>
  );
}
