import { formatRupees } from "@/lib/currency";

type PriceBreakdownProps = {
  baseAmount: number;
  gstAmount: number;
  totalAmount: number;
  gstPercent: number;
};

export default function PriceBreakdown({ baseAmount, gstAmount, totalAmount, gstPercent }: PriceBreakdownProps) {
  return (
    <dl className="space-y-2.5 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm">
      <div className="flex items-center justify-between">
        <dt className="font-medium text-slate-500">Base price</dt>
        <dd className="font-semibold text-slate-800">{formatRupees(baseAmount)}</dd>
      </div>
      <div className="flex items-center justify-between">
        <dt className="font-medium text-slate-500">GST ({gstPercent}%)</dt>
        <dd className="font-semibold text-slate-800">{formatRupees(gstAmount)}</dd>
      </div>
      <div className="flex items-center justify-between border-t border-slate-200 pt-3">
        <dt className="font-bold text-slate-800">Total to pay</dt>
        <dd className="font-display text-xl font-bold text-navy-blue">{formatRupees(totalAmount)}</dd>
      </div>
    </dl>
  );
}
