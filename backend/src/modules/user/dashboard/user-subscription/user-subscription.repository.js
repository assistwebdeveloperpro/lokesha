const { db } = require("../../../../config/db");
const orderRepository = require("../../../shared/subscription/repositories/subscription-order.repository");
const { PACKAGE_CODES } = require("../../../shared/subscription/constants/subscription.constants");

const PACKAGES_TABLE = "subscription_packages";

async function findActivePackages() {
  return db(PACKAGES_TABLE).where({ status: "active" }).orderBy("display_order", "asc").orderBy("created_at", "asc");
}

// Only the Standard package is sold online, the Free one is granted
async function findPurchasablePackage() {
  return db(PACKAGES_TABLE).where({ code: PACKAGE_CODES.STANDARD, status: "active" }).first();
}

async function findLeadPackPackage() {
  return db(PACKAGES_TABLE).where({ code: PACKAGE_CODES.LEADS, status: "active" }).first();
}

// Owned, live and limited; unlimited and expired properties have nothing to buy
async function findEligibleProperty(userId, propertyId, now) {
  return db("properties")
    .where({ id: propertyId, user_id: userId, status: "published" })
    .whereNotNull("lead_limit")
    .andWhere((builder) => builder.whereNull("expires_at").orWhere("expires_at", ">", now))
    .first("id", "title", "listing_number");
}

async function findCheckoutUser(userId) {
  return db("users").where({ id: userId }).first("id", "name", "email", "mobile_number");
}

const insertOrder = (row) => orderRepository.insertOrder(db, row);
const updateOrder = (id, columns) => orderRepository.updateOrder(db, id, columns);

module.exports = {
  findActivePackages,
  findPurchasablePackage,
  findLeadPackPackage,
  findEligibleProperty,
  findCheckoutUser,
  insertOrder,
  updateOrder,
  findOrderForUser: orderRepository.findOrderForUser,
};
