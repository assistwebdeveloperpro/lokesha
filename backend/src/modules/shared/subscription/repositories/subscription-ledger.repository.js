const TABLE = "subscription_credit_ledger";

// Insert only, the ledger is never updated or deleted
async function insertEntry(trx, entry) {
  await trx(TABLE).insert({
    subscription_id: entry.subscriptionId,
    user_id: entry.userId,
    type: entry.type,
    credits: entry.credits,
    property_id: entry.propertyId ?? null,
    reason: entry.reason ?? null,
    admin_id: entry.adminId ?? null,
  });
}

module.exports = { insertEntry };
