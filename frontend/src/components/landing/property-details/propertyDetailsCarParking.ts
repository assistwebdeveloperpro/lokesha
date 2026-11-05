export type VariantParkingCharges = {
  carParkingAvailable?: boolean | null;
  carParkingCount?: number | string | null;
};

export type VariantWithParking = {
  label?: string | null;
  charges?: VariantParkingCharges | null;
};

const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export function formatCarParkingSpaces(count: number): string {
  return count === 1 ? "1 car parking space" : `${count} car parking spaces`;
}

function parkingFromVariantCharges(charges?: VariantParkingCharges | null) {
  if (!charges) return null;

  const count = toNumber(charges.carParkingCount);
  if (charges.carParkingAvailable === false && (count === null || count === 0)) {
    return { available: false, count: 0 as const };
  }

  const available =
    charges.carParkingAvailable === true || (count !== null && count > 0);
  if (!available) return null;

  return {
    available: true as const,
    count: count !== null && count > 0 ? count : null,
  };
}

export function resolveCarParkingLabel(options: {
  listingCount?: number | null;
  attributeCount?: number | null;
  variants?: VariantWithParking[];
}): string | null {
  const variantParking = (options.variants ?? [])
    .map((variant) => parkingFromVariantCharges(variant.charges))
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  if (variantParking.length > 0) {
    const withParking = variantParking.filter((entry) => entry.available);
    if (withParking.length === 0) return "Not available";

    const counts = withParking
      .map((entry) => entry.count)
      .filter((count): count is number => count !== null && count > 0);

    if (counts.length === 0) return "Available";

    const min = Math.min(...counts);
    const max = Math.max(...counts);
    if (min === max) return formatCarParkingSpaces(min);
    return `${min}–${max} car parking spaces (varies by configuration)`;
  }

  const count = toNumber(options.attributeCount ?? options.listingCount);
  if (count === null) return null;
  if (count === 0) return "Not available";
  return formatCarParkingSpaces(count);
}
