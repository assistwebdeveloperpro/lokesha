const { SQFT_PER_UNIT, LIMITS } = require("./property.constants");

const DEFAULT_AREA_UNIT = "sq-ft";
const MAX_AREA_SQFT = 9999999999.99;

const round2 = (value) => Math.round(value * 100) / 100;

function toSqft(value, unit) {
  if (value === undefined || value === null) return null;

  const sqft = round2(value * (SQFT_PER_UNIT[unit ?? DEFAULT_AREA_UNIT] ?? 1));
  return sqft > MAX_AREA_SQFT ? null : sqft;
}

function smallest(values) {
  const present = values.filter((value) => value !== null && value !== undefined);
  return present.length ? Math.min(...present) : null;
}

// Builder: smallest unit; plot and land: plot area; others: carpet, then super built up, then plot area
function deriveAreaSqft(rule, listing) {
  const { details = {}, plotDetails = {}, variants } = listing;

  if (variants?.length) {
    return smallest(variants.map((variant) => toSqft(variant.size, variant.sizeUnit)));
  }

  const plotArea = toSqft(plotDetails.plotArea, plotDetails.plotAreaUnit);
  if (rule.typeTable === "plot" || rule.typeTable === "land") {
    return plotArea;
  }

  return (
    toSqft(details.carpetArea, details.carpetAreaUnit) ??
    toSqft(details.superBuiltUpArea, details.superBuiltUpAreaUnit) ??
    plotArea
  );
}

// Variants win (lowest unit price), then the sale price or monthly rent
function derivePrice(listingType, listing) {
  if (listing.variants?.length) {
    return smallest(listing.variants.map((variant) => variant.price));
  }

  const { pricing = {} } = listing;
  return (listingType === "sale" ? pricing.expectedPrice : pricing.monthlyRent) ?? null;
}

function deriveVariantPriceRange(variants = []) {
  const prices = variants.map((variant) => variant.price).filter((value) => value !== undefined);
  return prices.length
    ? { priceMin: Math.min(...prices), priceMax: Math.max(...prices) }
    : { priceMin: undefined, priceMax: undefined };
}

function deriveTitle({ rule, subTypeName, listing, locality, projectName }) {
  const { details = {} } = listing;
  let title;

  if (rule.typeTable === "pg" && details.pgName) {
    title = details.pgName;
  } else if (projectName) {
    title = `${projectName} ${subTypeName}`;
  } else if (rule.typeTable === "residential" && details.bedrooms) {
    title = `${details.bedrooms} BHK ${subTypeName} in ${locality}`;
  } else {
    title = `${subTypeName} in ${locality}`;
  }

  return title.slice(0, LIMITS.titleMaxLength).trim();
}

module.exports = { toSqft, deriveAreaSqft, derivePrice, deriveVariantPriceRange, deriveTitle };
