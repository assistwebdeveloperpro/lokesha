"use client";

import { useState } from "react";
import FloatingInput from "@/components/shared/FloatingInput";
import { giftCredits } from "@/services/adminSubscription.service";
import { ActionModal, ReasonField } from "./ActionModal";
import { toWholeNumber, validateGift, type ActionErrors } from "./subscriptionActionsShared";
import { useAdminActionRunner } from "./useAdminActionRunner";

type GiftCreditsModalProps = {
  user: { id: string; name: string };
  onClose: () => void;
  onDone: (message: string) => void;
};

export default function GiftCreditsModal({ user, onClose, onDone }: GiftCreditsModalProps) {
  const { run, isRunning, error, fieldErrors, clearError } = useAdminActionRunner();
  const [form, setForm] = useState({ credits: "1", months: "1", reason: "" });
  const [errors, setErrors] = useState<ActionErrors>({});

  const change = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    clearError();
  };

  const handleConfirm = async () => {
    const found = validateGift(form);
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }

    const result = await run((token) =>
      giftCredits({ userId: user.id, credits: toWholeNumber(form.credits), months: toWholeNumber(form.months), reason: form.reason.trim() }, token),
    );
    if (result) onDone(`${result.credits} ${result.credits === 1 ? "credit was" : "credits were"} added to ${user.name}.`);
  };

  const shown = { ...errors, ...fieldErrors };

  return (
    <ActionModal
      title="Gift listing credits"
      description={`Add extra credits for ${user.name}. They work like a purchase and end on the date below.`}
      confirmLabel="Add credits"
      runningLabel="Adding..."
      isRunning={isRunning}
      error={error}
      onClose={onClose}
      onConfirm={handleConfirm}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FloatingInput id="gift-credits" label="Credits" type="number" inputMode="numeric" value={form.credits} onChange={(value) => change("credits", value)} error={shown.credits} />
        <FloatingInput id="gift-months" label="Valid for (months)" type="number" inputMode="numeric" value={form.months} onChange={(value) => change("months", value)} error={shown.months} />
      </div>
      <ReasonField id="gift-reason" value={form.reason} error={shown.reason} disabled={isRunning} onChange={(value) => change("reason", value)} />
    </ActionModal>
  );
}
