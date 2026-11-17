"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useToast } from "@/components/shared/ui/ToastProvider";
import { savePropertyInputClassName, savePropertySubmitClassName } from "./savePropertyModal.styles";

const TERMS_AND_CONDITIONS_HREF = "/terms-and-conditions";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SavePropertyRegisterValues = {
  name: string;
  email: string;
  agreed: boolean;
};

type SavePropertyRegisterStepProps = {
  isSubmitting: boolean;
  onSubmit: (values: SavePropertyRegisterValues) => void;
};

function validate({ name, email, agreed }: SavePropertyRegisterValues) {
  if (name.trim().length < 3) return "Name must be at least 3 characters long.";
  if (!EMAIL_PATTERN.test(email.trim())) return "Please enter a valid email id.";
  if (!agreed) return "Please accept the terms and conditions.";
  return null;
}

export function SavePropertyRegisterStep({ isSubmitting, onSubmit }: SavePropertyRegisterStepProps) {
  const { showToast } = useToast();
  const [values, setValues] = useState<SavePropertyRegisterValues>({ name: "", email: "", agreed: false });

  const setField = <K extends keyof SavePropertyRegisterValues>(key: K, value: SavePropertyRegisterValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const validationError = validate(values);
    if (validationError) {
      showToast(validationError, "error");
      return;
    }

    onSubmit({ ...values, name: values.name.trim(), email: values.email.trim() });
  };

  return (
    <form className="space-y-3.5" onSubmit={handleSubmit} noValidate>
      <input
        type="text"
        autoComplete="name"
        autoFocus
        placeholder="Full Name"
        aria-label="Full Name"
        value={values.name}
        onChange={(event) => setField("name", event.target.value)}
        className={savePropertyInputClassName}
      />
      <input
        type="email"
        autoComplete="email"
        placeholder="Email Address"
        aria-label="Email Address"
        value={values.email}
        onChange={(event) => setField("email", event.target.value)}
        className={savePropertyInputClassName}
      />
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-3 text-[13px] leading-5 text-slate-600 transition hover:border-navy-blue/40 has-checked:border-navy-blue/50 has-checked:bg-navy-blue/5">
        <input
          type="checkbox"
          checked={values.agreed}
          onChange={(event) => setField("agreed", event.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-navy-blue"
        />
        <span>
          Yes, I agree to the{" "}
          <Link
            href={TERMS_AND_CONDITIONS_HREF}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="font-semibold text-navy-blue underline-offset-2 hover:underline"
          >
            Terms &amp; Conditions
          </Link>
          .
        </span>
      </label>
      <button type="submit" disabled={isSubmitting} className={savePropertySubmitClassName}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
