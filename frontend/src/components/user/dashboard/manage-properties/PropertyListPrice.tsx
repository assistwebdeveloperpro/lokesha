import {
  formatPrice,
  formatPriceAmount,
  hasPropertyPriceRange,
  type PropertyListPriceFields,
} from "./managePropertiesShared";

type PropertyListPriceTone = "default" | "hero";

type PropertyListPriceProps = {
  item: PropertyListPriceFields;
  className?: string;
  tone?: PropertyListPriceTone;
};

const TONE_CLASSES: Record<
  PropertyListPriceTone,
  { margin: string; amount: string; range: string; empty: string }
> = {
  default: {
    margin: "mt-2",
    amount:
      "text-sm font-bold tabular-nums leading-snug text-navy-blue sm:gap-x-1.5 sm:text-medium md:text-lg lg:text-lg",
    range:
      "text-xs font-bold tabular-nums leading-snug text-navy-blue sm:gap-x-1.5 sm:text-medium md:text-lg lg:text-lg",
    empty: "text-sm font-bold leading-snug text-navy-blue sm:text-xl",
  },
  hero: {
    margin: "mt-0.5",
    amount:
      "text-base font-bold tabular-nums leading-snug text-navy-blue sm:text-lg md:text-xl lg:text-xl",
    range:
      "text-base font-bold tabular-nums leading-snug text-navy-blue sm:text-lg md:text-xl lg:text-xl",
    empty: "text-base font-bold leading-snug text-navy-blue sm:text-lg md:text-xl lg:text-xl",
  },
};

export default function PropertyListPrice({
  item,
  className = "",
  tone = "default",
}: PropertyListPriceProps) {
  const styles = TONE_CLASSES[tone];
  const min = item.priceMin ?? item.price;
  const max = item.priceMax ?? min;

  if (min === null || min === undefined) {
    return (
      <p
        className={`${styles.margin} min-w-0 wrap-break-word ${styles.empty} ${className}`.trim()}
      >
        Price on request
      </p>
    );
  }

  if (hasPropertyPriceRange(item) && max !== null && max !== undefined) {
    const suffix = item.listingType === "rent-lease" ? "/month" : "";
    return (
      <p
        className={`${styles.margin} flex min-w-0 flex-wrap items-baseline gap-x-1 gap-y-0.5 ${styles.range} ${className}`.trim()}
      >
        <span className="wrap-break-word">{formatPriceAmount(min)}</span>
        <span className="shrink-0 text-slate-500">-</span>
        <span className="wrap-break-word">
          {formatPriceAmount(max)}
          {suffix}
        </span>
      </p>
    );
  }

  return (
    <p
      className={`${styles.margin} flex min-w-0 flex-wrap items-baseline gap-x-1 gap-y-0.5 ${styles.amount} ${className}`.trim()}
    >
      {formatPrice(item)}
    </p>
  );
}
