"use client";

import { CalendarDays } from "lucide-react";
import { useState } from "react";
import FloatingInput from "@/components/shared/FloatingInput";
import { extendSubscription } from "@/services/adminSubscription.service";
import { ActionModal, ReasonField } from "./ActionModal";
import { toWholeNumber, validateExtend, type ActionErrors } from "./subscriptionActionsShared";
import { useAdminActionRunner } from "./useAdminActionRunner";

type ExtendSubscriptionModalProps = {
  subscription: { id: string; packageName: string; endsAt: string };
  onClose: () => void;
  onDone: (message: string) => void;
};

const formatDay = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

export default function ExtendSubscriptionModal({ subscription, onClose, onDone }: ExtendSubscriptionModalProps) {
  const { run, isRunning, error, fieldErrors, clearError } = useAdminActionRunner();
  const [form, setForm] = useState({ months: "1", reason: "" });
  const [errors, setErrors] = useState<ActionErrors>({});

  const change = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    clearError();
  };

  const handleConfirm = async () => {
    const found = validateExtend(form);
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }

    const result = await run((token) =>
      extendSubscription({ subscriptionId: subscription.id, months: toWholeNumber(form.months), reason: form.reason.trim() }, token),
    );
    if (result) onDone(`The subscription now ends on ${formatDay(result.endsAt)}.`);
  };

  const shown = { ...errors, ...fieldErrors };

  return (
    <ActionModal
      title="Extend subscription"
      description="Moves the end date and the end date of its live properties."
      confirmLabel="Extend"
      runningLabel="Extending..."
      isRunning={isRunning}
      error={error}
      onClose={onClose}
      onConfirm={handleConfirm}
    >
      <div className="flex items-start gap-3 rounded-xl bg-sky-50 px-4 py-3 ring-1 ring-sky-100">
        <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" aria-hidden />
        <p className="text-sm font-medium text-sky-900">
          {subscription.packageName} package ends on <span className="font-bold">{formatDay(subscription.endsAt)}</span>
        </p>
      </div>
      <FloatingInput id="extend-months" label="Extend by (months)" type="number" inputMode="numeric" value={form.months} onChange={(value) => change("months", value)} error={shown.months} />
      <ReasonField id="extend-reason" value={form.reason} error={shown.reason} disabled={isRunning} onChange={(value) => change("reason", value)} />
    </ActionModal>
  );
}
