import { formatRupees } from "@/lib/currency";
import type { PaymentRecord } from "@/services/userSubscription.service";
import InvoiceDownloadButton from "./InvoiceDownloadButton";
import { PAYMENT_GRID_CLASS, PAYMENT_TABLE_COLUMNS, PAYMENT_TABLE_MIN_WIDTH_CLASS } from "./paymentsTableLayout";
import { ORDER_STATUS_TONES, formatDateTime, plural } from "./subscriptionShared";

function PaymentRow({ payment }: { payment: PaymentRecord }) {
  const tone = ORDER_STATUS_TONES[payment.status];

  return (
    <li className={`border-b border-slate-100 px-4 py-4 last:border-b-0 sm:px-5 ${PAYMENT_GRID_CLASS}`}>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-slate-800">{payment.orderNumber}</p>
        <p className="text-xs font-medium text-slate-500">{formatDateTime(payment.paidAt ?? payment.createdAt)}</p>
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-800">Standard package</p>
        <p className="text-xs font-medium text-slate-500">
          {plural(payment.listings, "listing")} · {plural(payment.months, "month")}
        </p>
      </div>

      <div>
        <p className="text-sm font-bold text-slate-800">{formatRupees(payment.totalAmount)}</p>
        <p className="text-xs font-medium text-slate-500">
          {formatRupees(payment.baseAmount)} + {formatRupees(payment.gstAmount)} GST
        </p>
      </div>

      <div>
        <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${tone.className}`}>
          {tone.label}
        </span>
        {payment.status === "failed" && payment.failureReason ? (
          <p className="mt-1 line-clamp-2 text-xs font-medium text-slate-500">{payment.failureReason}</p>
        ) : null}
      </div>

      <div>
        {payment.invoice ? (
          <InvoiceDownloadButton invoiceId={payment.invoice.id} invoiceNumber={payment.invoice.number} />
        ) : (
          <span className="text-xs font-medium text-slate-400">—</span>
        )}
      </div>
    </li>
  );
}

export default function PaymentsTable({ payments }: { payments: PaymentRecord[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-sm scrollbar-hidden">
      <div className={PAYMENT_TABLE_MIN_WIDTH_CLASS}>
        <div
          className={`border-b border-slate-200 bg-slate-50 px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 ${PAYMENT_GRID_CLASS}`}
        >
          {PAYMENT_TABLE_COLUMNS.map((column) => (
            <span key={column}>{column}</span>
          ))}
        </div>
        <ul>
          {payments.map((payment) => (
            <PaymentRow key={payment.id} payment={payment} />
          ))}
        </ul>
      </div>
    </div>
  );
}
