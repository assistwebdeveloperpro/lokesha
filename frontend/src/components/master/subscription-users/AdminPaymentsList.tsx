import { Undo2 } from "lucide-react";
import AdminDocumentDownloadButton from "@/components/master/subscription-actions/AdminDocumentDownloadButton";
import { ORDER_STATUS_TONES, formatDateTime, plural } from "@/components/user/dashboard/subscription/subscriptionShared";
import { formatRupees } from "@/lib/currency";
import type { PaymentRecord } from "@/services/userSubscription.service";

type AdminPaymentsListProps = {
  payments: PaymentRecord[];
  onRefund: (payment: PaymentRecord) => void;
};

function PaymentItem({ payment, onRefund }: { payment: PaymentRecord; onRefund: AdminPaymentsListProps["onRefund"] }) {
  const tone = ORDER_STATUS_TONES[payment.status];

  return (
    <li className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-800">{payment.orderNumber}</p>
          <p className="text-xs font-medium text-slate-500">{formatDateTime(payment.paidAt ?? payment.createdAt)}</p>
        </div>
        <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${tone.className}`}>{tone.label}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            {plural(payment.listings, "listing")} · {plural(payment.months, "month")}
          </p>
          <p className="text-xs font-medium text-slate-500">
            {formatRupees(payment.totalAmount)} ({formatRupees(payment.baseAmount)} + {formatRupees(payment.gstAmount)} GST)
          </p>
          {payment.status === "failed" && payment.failureReason ? <p className="mt-1 text-xs font-medium text-red-600">{payment.failureReason}</p> : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {payment.invoice ? <AdminDocumentDownloadButton documentId={payment.invoice.id} documentNumber={payment.invoice.number} label="Invoice" /> : null}
          {payment.status === "paid" ? (
            <button
              type="button"
              onClick={() => onRefund(payment)}
              className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 text-xs font-semibold text-red-600 shadow-sm transition hover:bg-red-50"
            >
              <Undo2 className="h-3.5 w-3.5" aria-hidden />
              Refund
            </button>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export default function AdminPaymentsList({ payments, onRefund }: AdminPaymentsListProps) {
  return (
    <ul className="space-y-3">
      {payments.map((payment) => (
        <PaymentItem key={payment.id} payment={payment} onRefund={onRefund} />
      ))}
    </ul>
  );
}
