const repository = require("./user-subscription.repository");
const { startCheckout, generateOrderNumber, toUserPackage } = require("./user-subscription.service");
const { calculateLeadPrice } = require("../../../shared/subscription/utils/subscription-pricing.util");
const { ORDER_STATUSES, ORDER_TYPES, ERROR_CODES } = require("../../../shared/subscription/constants/subscription.constants");
const { AppError } = require("../../../shared/property/utils/property.errors");

const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const CONFLICT = 409;
const MIN_CHARGE = 1;

async function loadLeadPackPackage() {
  const pkg = await repository.findLeadPackPackage();
  if (!pkg) {
    throw new AppError("Buying more leads is not available right now.", CONFLICT, { code: ERROR_CODES.PACKAGE_INACTIVE });
  }
  return pkg;
}

function assertQuantityAllowed(pkg, leads) {
  if (leads >= pkg.min_leads && leads <= pkg.max_leads) return;

  const message = `Choose between ${pkg.min_leads} and ${pkg.max_leads} leads`;
  throw new AppError(message, BAD_REQUEST, { code: ERROR_CODES.INVALID_LEAD_QUANTITY, errors: [message], fields: { leads: message } });
}

async function loadEligibleProperty(userId, propertyId, now) {
  const property = await repository.findEligibleProperty(userId, propertyId, now);
  if (!property) {
    throw new AppError("Extra leads can only be bought for your live property that has a lead limit.", CONFLICT, {
      code: ERROR_CODES.LEAD_PACK_NOT_ELIGIBLE,
    });
  }
  return property;
}

// The price always comes from the stored package, never from the client
function buildLeadQuote(pkg, property, leads) {
  assertQuantityAllowed(pkg, leads);

  const gstPercent = Number(pkg.gst_percent);
  const price = calculateLeadPrice({ leads, pricePerLead: pkg.price_per_lead, gstPercent });
  if (price.totalAmount < MIN_CHARGE) {
    throw new AppError("Extra leads cannot be purchased online right now.", CONFLICT, { code: ERROR_CODES.PACKAGE_INACTIVE });
  }

  return {
    packageId: pkg.id,
    property: { id: property.id, title: property.title, listingNumber: Number(property.listing_number) },
    leads,
    pricePerLead: pkg.price_per_lead,
    gstPercent,
    ...price,
  };
}

async function getLeadPackQuote(userId, { propertyId, leads }) {
  const now = new Date();
  const pkg = await loadLeadPackPackage();
  const property = await loadEligibleProperty(userId, propertyId, now);

  return buildLeadQuote(pkg, property, leads);
}

async function createLeadPackOrder(userId, { propertyId, leads, gstin }) {
  const now = new Date();
  const pkg = await loadLeadPackPackage();
  const property = await loadEligibleProperty(userId, propertyId, now);
  const quote = buildLeadQuote(pkg, property, leads);

  const user = await repository.findCheckoutUser(userId);
  if (!user) throw new AppError("User not found", NOT_FOUND);

  // Saved first with the package terms of this moment, so later admin edits never change this order
  const order = await repository.insertOrder({
    order_number: generateOrderNumber(now),
    order_type: ORDER_TYPES.LEAD_PACK,
    user_id: userId,
    package_id: pkg.id,
    property_id: property.id,
    leads,
    price_per_lead: quote.pricePerLead,
    gst_percent: quote.gstPercent,
    base_amount: quote.baseAmount,
    gst_amount: quote.gstAmount,
    total_amount: quote.totalAmount,
    status: ORDER_STATUSES.CREATED,
    user_gstin: gstin || null,
    snapshot: JSON.stringify({ package: toUserPackage(pkg), quote }),
  });

  const checkout = await startCheckout({
    order,
    user,
    totalAmount: quote.totalAmount,
    description: `Extra leads: ${leads} for ${property.title}`,
  });

  return { ...checkout, quote };
}

module.exports = { getLeadPackQuote, createLeadPackOrder, buildLeadQuote };
