"use client";

import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { formatRupees } from "@/lib/currency";
import { refundOrder } from "@/services/adminSubscription.service";
import type { OrderType } from "@/services/userSubscription.service";
import { ActionModal, ReasonField } from "./ActionModal";
import { validateRefund, type ActionErrors } from "./subscriptionActionsShared";
import { useAdminActionRunner } from "./useAdminActionRunner";

type RefundOrderModalProps = {
  order: { id: string; orderNumber: string; totalAmount: number; orderType: OrderType };
  onClose: () => void;
  onDone: (message: string) => void;
};

const CREDIT_REFUND_NOTES = [
  "Unused credits of this order are cancelled.",
  "Credits already used stay with the live properties. Close those separately if needed.",
];

const LEAD_REFUND_NOTES = [
  "The leads of this order are taken off the property.",
  "A refund is blocked when any of these leads were already used.",
];

export default function RefundOrderModal({ order, onClose, onDone }: RefundOrderModalProps) {
  const { run, isRunning, error, fieldErrors, clearError } = useAdminActionRunner();
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<ActionErrors>({});

  const handleConfirm = async () => {
    const found = validateRefund({ reason });
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }

    const result = await run((token) => refundOrder({ orderId: order.id, reason: reason.trim() }, token));
    if (result) onDone(`Order ${order.orderNumber} was refunded${result.creditNote ? ` and credit note ${result.creditNote.number} was issued` : ""}.`);
  };

  return (
    <ActionModal
      title={`Refund ${formatRupees(order.totalAmount)}`}
      description={`Order ${order.orderNumber} is refunded in full to the original payment method.`}
      confirmLabel="Refund order"
      runningLabel="Refunding..."
      tone="danger"
      isRunning={isRunning}
      error={error}
      onClose={onClose}
      onConfirm={handleConfirm}
    >
      <div className="flex items-start gap-3 rounded-xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
        <ul className="space-y-1 text-sm font-medium text-amber-900">
          <li>The money is returned through Razorpay and this cannot be undone.</li>
          {(order.orderType === "lead_pack" ? LEAD_REFUND_NOTES : CREDIT_REFUND_NOTES).map((note) => (
            <li key={note}>{note}</li>
          ))}
          <li>A credit note is issued against the invoice.</li>
        </ul>
      </div>
      <ReasonField
        id="refund-reason"
        value={reason}
        error={errors.reason ?? fieldErrors.reason}
        disabled={isRunning}
        onChange={(value) => {
          setReason(value);
          setErrors({});
          clearError();
        }}
      />
    </ActionModal>
  );
}
