"use client";

import { Building2 } from "lucide-react";
import { formatRupees } from "@/lib/currency";
import type { PropertyLeadUsage, PurchasablePackage } from "@/services/userSubscription.service";
import BuyMoreLeadsModalSkeleton from "./BuyMoreLeadsModalSkeleton";
import PaymentDialog from "./PaymentDialog";
import PriceBreakdown from "./PriceBreakdown";
import QuantityStepper from "./QuantityStepper";
import { formatLeadPrice, getPayLabel, plural } from "./subscriptionShared";
import { useLeadPackPurchase } from "./useLeadPackPurchase";

type BuyMoreLeadsModalProps = {
  pkg: PurchasablePackage;
  property: PropertyLeadUsage;
  onClose: () => void;
  onCompleted: () => void;
};

export default function BuyMoreLeadsModal({ pkg, property, onClose, onCompleted }: BuyMoreLeadsModalProps) {
  const purchase = useLeadPackPurchase({ pkg, property, onClose, onCompleted });
  const { quote, isQuoting, phase } = purchase;
  const isFirstQuote = !quote && isQuoting;

  return (
    <PaymentDialog
      headingId="buy-more-leads-heading"
      title="Buy more leads"
      subtitle="Extra leads stay with this property until they are used"
      closeLabel="Close buy more leads"
      isBusy={phase !== "idle"}
      payLabel={getPayLabel(phase, quote?.totalAmount ?? 0)}
      isPayDisabled={!purchase.isPayable}
      gstin={purchase.gstin}
      gstinError={purchase.gstinError}
      message={purchase.message}
      onGstinChange={purchase.changeGstin}
      onClose={onClose}
      onPay={purchase.pay}
    >
      {isFirstQuote ? (
        <BuyMoreLeadsModalSkeleton />
      ) : (
        <>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Building2 className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-800">{property.title}</p>
                <p className="text-xs font-medium text-slate-500">Listing #{property.listingNumber}</p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs font-medium text-slate-500">Leads used</p>
              <p className="text-sm font-bold text-slate-800">
                {property.leadsReceived} <span className="font-medium text-slate-400">of {property.leadLimit}</span>
              </p>
            </div>
          </div>

          <div>
            <QuantityStepper
              id="extra-leads"
              label="Extra leads"
              unit="lead"
              value={purchase.leads}
              min={purchase.choices.min}
              max={purchase.choices.max}
              disabled={phase !== "idle"}
              onChange={purchase.changeLeads}
            />
            <p className="mt-2 text-xs font-medium text-slate-500">{formatLeadPrice(pkg)}</p>
          </div>

          {quote ? (
            <div className={`transition-opacity ${isQuoting ? "opacity-50" : ""}`} aria-busy={isQuoting}>
              <PriceBreakdown
                baseAmount={quote.baseAmount}
                gstAmount={quote.gstAmount}
                totalAmount={quote.totalAmount}
                gstPercent={quote.gstPercent}
                baseLabel={`${plural(quote.leads, "lead")} × ${formatRupees(quote.pricePerLead)}`}
              />
            </div>
          ) : null}
        </>
      )}
    </PaymentDialog>
  );
}
