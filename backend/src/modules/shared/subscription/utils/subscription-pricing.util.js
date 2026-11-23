const isPositiveInt = (value) => Number.isInteger(value) && value > 0;

const PAISE_PER_RUPEE = 100;

// Amounts are whole rupees; only the payment gateway works in paise
const toGatewayAmount = (rupees) => rupees * PAISE_PER_RUPEE;

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

function calculateLeadPrice({ leads, pricePerLead, gstPercent }) {
  if (!isPositiveInt(leads)) {
    throw new RangeError("leads must be a positive integer");
  }
  if (!Number.isInteger(pricePerLead) || pricePerLead < 0) {
    throw new RangeError("price must be a non-negative integer");
  }
  if (typeof gstPercent !== "number" || gstPercent < 0) {
    throw new RangeError("gstPercent must be a non-negative number");
  }

  const baseAmount = leads * pricePerLead;
  const gstAmount = Math.round((baseAmount * gstPercent) / 100);
  return { baseAmount, gstAmount, totalAmount: baseAmount + gstAmount };
}

module.exports = { calculatePrice, calculateLeadPrice, toGatewayAmount };
