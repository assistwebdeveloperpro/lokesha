const { db } = require("../../../config/db");

const TABLE = "razorpay_webhook_events";


async function insertEventIfAbsent({ eventId, type, payload }) {
  await db(TABLE)
    .insert({ event_id: eventId, type, payload: JSON.stringify(payload) })
    .onConflict("event_id")
    .ignore();
}

async function findEvent(eventId) {
  return db(TABLE).where({ event_id: eventId }).first("event_id", "processed_at");
}

async function markProcessed(eventId) {
  await db(TABLE).where({ event_id: eventId }).update({ processed_at: db.fn.now() });
}

module.exports = { insertEventIfAbsent, findEvent, markProcessed };
