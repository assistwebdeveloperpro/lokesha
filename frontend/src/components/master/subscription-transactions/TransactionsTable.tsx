import { Undo2 } from "lucide-react";
import { formatRupees } from "@/lib/currency";
import type { AdminTransaction } from "@/services/adminSubscription.service";
import { ORDER_STATUS_TONES, describeOrderQuantity, formatDateTime } from "@/components/user/dashboard/subscription/subscriptionShared";
import AdminDocumentDownloadButton from "@/components/master/subscription-actions/AdminDocumentDownloadButton";
import {
  TRANSACTION_GRID_CLASS,
  TRANSACTION_TABLE_COLUMNS,
  TRANSACTION_TABLE_MIN_WIDTH_CLASS,
  canRefund,
  shortenReference,
} from "./transactionsShared";

type TransactionsTableProps = {
  transactions: AdminTransaction[];
  onRefund: (transaction: AdminTransaction) => void;
};

function Reference({ label, value }: { label: string; value: string | null }) {
  return (
    <p className="text-xs font-medium text-slate-500" title={value ?? undefined}>
      <span className="text-slate-400">{label} </span>
      <span className="font-mono text-slate-600">{shortenReference(value)}</span>
    </p>
  );
}

function TransactionRow({ transaction, onRefund }: { transaction: AdminTransaction; onRefund: TransactionsTableProps["onRefund"] }) {
  const tone = ORDER_STATUS_TONES[transaction.status];

  return (
    <li className={`border-b border-slate-100 px-4 py-4 last:border-b-0 sm:px-5 ${TRANSACTION_GRID_CLASS}`}>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-slate-800">{transaction.orderNumber}</p>
        <p className="text-xs font-medium text-slate-500">{formatDateTime(transaction.createdAt)}</p>
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-800">{transaction.user.name}</p>
        <p className="text-xs font-medium text-slate-500">{transaction.user.mobile}</p>
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-800">{transaction.packageName}</p>
        <p className="text-xs font-medium text-slate-500">{describeOrderQuantity(transaction)}</p>
        <p className="text-xs font-medium text-slate-400">
          {transaction.orderType === "lead_pack"
            ? `${formatRupees(transaction.pricePerLead ?? 0)} / lead`
            : `${formatRupees(transaction.pricePerListingMonth ?? 0)} / listing / month`}
        </p>
      </div>

      <div>
        <p className="text-sm font-bold text-slate-800">{formatRupees(transaction.totalAmount)}</p>
        <p className="text-xs font-medium text-slate-500">
          {formatRupees(transaction.baseAmount)} + {formatRupees(transaction.gstAmount)} GST
        </p>
      </div>

      <div className="min-w-0 space-y-0.5">
        <Reference label="Order" value={transaction.razorpayOrderId} />
        <Reference label="Payment" value={transaction.razorpayPaymentId} />
      </div>

      <div>
        <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${tone.className}`}>{tone.label}</span>
        {transaction.status === "failed" && transaction.failureReason ? (
          <p className="mt-1 line-clamp-2 text-xs font-medium text-slate-500">{transaction.failureReason}</p>
        ) : null}
        {transaction.refundedAt ? <p className="mt-1 text-xs font-medium text-slate-500">{formatDateTime(transaction.refundedAt)}</p> : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {transaction.invoice ? (
          <AdminDocumentDownloadButton documentId={transaction.invoice.id} documentNumber={transaction.invoice.number} label="Invoice" />
        ) : null}
        {transaction.creditNote ? (
          <AdminDocumentDownloadButton documentId={transaction.creditNote.id} documentNumber={transaction.creditNote.number} label="Credit note" />
        ) : null}
        {canRefund(transaction) ? (
          <button
            type="button"
            onClick={() => onRefund(transaction)}
            className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 text-xs font-semibold text-red-600 shadow-sm transition hover:bg-red-50"
          >
            <Undo2 className="h-3.5 w-3.5" aria-hidden />
            Refund
          </button>
        ) : null}
        {!transaction.invoice && !transaction.creditNote && !canRefund(transaction) ? <span className="text-xs font-medium text-slate-400">—</span> : null}
      </div>
    </li>
  );
}

export default function TransactionsTable({ transactions, onRefund }: TransactionsTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-sm scrollbar-hidden">
      <div className={TRANSACTION_TABLE_MIN_WIDTH_CLASS}>
        <div
          className={`border-b border-slate-200 bg-slate-50 px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 ${TRANSACTION_GRID_CLASS}`}
        >
          {TRANSACTION_TABLE_COLUMNS.map((column) => (
            <span key={column}>{column}</span>
          ))}
        </div>
        <ul>
          {transactions.map((transaction) => (
            <TransactionRow key={transaction.id} transaction={transaction} onRefund={onRefund} />
          ))}
        </ul>
      </div>
    </div>
  );
}
