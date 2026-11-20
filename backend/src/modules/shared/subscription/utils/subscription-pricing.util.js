const isPositiveInt = (value) => Number.isInteger(value) && value > 0;

// Amounts are integers in the smallest currency unit (paise)
function calculatePrice({ listings, months, pricePerListingMonth, gstPercent }) {
  if (!isPositiveInt(listings) || !isPositiveInt(months)) {
    throw new RangeError("listings and months must be positive integers");
  }
  if (!Number.isInteger(pricePerListingMonth) || pricePerListingMonth < 0) {
    throw new RangeError("price must be a non-negative integer");
  }
  if (typeof gstPercent !== "number" || gstPercent < 0) {
    throw new RangeError("gstPercent must be a non-negative number");
  }

  const baseAmount = listings * months * pricePerListingMonth;
  const gstAmount = Math.round((baseAmount * gstPercent) / 100);
  return { baseAmount, gstAmount, totalAmount: baseAmount + gstAmount };
}

module.exports = { calculatePrice };
