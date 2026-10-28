import {
  formatPrice,
  formatPriceAmount,
  hasPropertyPriceRange,
  type PropertyListPriceFields,
} from "./managePropertiesShared";

type PropertyListPriceProps = {
  item: PropertyListPriceFields;
  className?: string;
};

export default function PropertyListPrice({ item, className = "" }: PropertyListPriceProps) {
  const min = item.priceMin ?? item.price;
  const max = item.priceMax ?? min;

  if (min === null || min === undefined) {
    return (
      <p
        className={`mt-2 min-w-0 wrap-break-word text-sm font-bold leading-snug text-navy-blue sm:text-xl ${className}`.trim()}
      >
        Price on request
      </p>
    );
  }

  if (hasPropertyPriceRange(item) && max !== null && max !== undefined) {
    const suffix = item.listingType === "rent-lease" ? "/month" : "";
    return (
      <p
        className={`mt-2 flex min-w-0 flex-wrap items-baseline gap-x-1 gap-y-0.5 text-xs font-bold tabular-nums leading-snug text-navy-blue sm:gap-x-1.5 sm:text-medium md:text-lg lg:text-lg ${className}`.trim()}
      >
        <span className="wrap-break-wordword">{formatPriceAmount(min)}</span>
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
      className={`mt-2 flex min-w-0 flex-wrap items-baseline gap-x-1 gap-y-0.5 text-sm font-bold tabular-nums leading-snug text-navy-blue sm:gap-x-1.5 sm:text-medium md:text-lg lg:text-lg ${className}`.trim()}
    >
      {formatPrice(item)}
    </p>
  );
}
