import type { PurchasablePackage } from "@/services/userSubscription.service";
import CheckoutPanel from "./CheckoutPanel";
import StandardPackageCard from "./StandardPackageCard";
import type { usePurchaseFlow } from "./usePurchaseFlow";

type PurchaseCardProps = {
  pkg: PurchasablePackage;
  flow: ReturnType<typeof usePurchaseFlow>;
};

export default function PurchaseCard({ pkg, flow }: PurchaseCardProps) {
  return (
    <section id="buy-standard" className="grid scroll-mt-24 items-start gap-5 sm:gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
      <StandardPackageCard pkg={pkg} flow={flow} />
      <CheckoutPanel pkg={pkg} flow={flow} />
    </section>
  );
}
