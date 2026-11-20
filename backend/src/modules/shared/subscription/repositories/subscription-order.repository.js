const { db } = require("../../../../config/db");

const TABLE = "subscription_orders";

async function insertOrder(trx, row) {
  const [order] = await trx(TABLE).insert(row).returning("*");
  return order;
}

async function updateOrder(trx, id, columns) {
  const [order] = await trx(TABLE)
    .where({ id })
    .update({ ...columns, updated_at: trx.fn.now() })
    .returning("*");
  return order;
}

// Locks the row, so a webhook and the browser return never confirm one order together
async function findOrderByIdForUpdate(trx, id) {
  return trx(TABLE).where({ id }).forUpdate().first();
}

async function findOrderByRazorpayOrderIdForUpdate(trx, razorpayOrderId) {
  return trx(TABLE).where({ razorpay_order_id: razorpayOrderId }).forUpdate().first();
}

async function findOrderByRazorpayOrderId(razorpayOrderId) {
  return db(TABLE).where({ razorpay_order_id: razorpayOrderId }).first();
}

// Always scoped to the owner, so a user never reads another user's order
async function findOrderForUser(userId, id) {
  return db(TABLE).where({ id, user_id: userId }).first();
}

module.exports = {
  insertOrder,
  updateOrder,
  findOrderByIdForUpdate,
  findOrderByRazorpayOrderIdForUpdate,
  findOrderByRazorpayOrderId,
  findOrderForUser,
};
