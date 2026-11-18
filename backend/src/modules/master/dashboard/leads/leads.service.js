const { db } = require("../../../../config/db");
const repository = require("./leads.repository");
const notificationRepository = require("../../../user/dashboard/user-notifications/user-notifications.repository");
const notificationTemplates = require("../../../user/dashboard/user-notifications/user-notifications.templates");
const { AppError } = require("../../../shared/property/utils/property.errors");

const toLead = (row) => ({
  id: row.id,
  lead: { name: row.lead_name, mobile: row.lead_mobile, email: row.lead_email },
  property: {
    id: row.property_id,
    title: row.project_name || row.property_title,
    listingNumber: Number(row.listing_number),
    propertyType: row.property_type,
    listingType: row.listing_type,
    locality: row.locality,
    city: row.city,
  },
  lister: { name: row.lister_name, mobile: row.lister_mobile, listedBy: row.lister_listed_by },
  contactRole: row.lister_role,
  phoneRevealed: row.phone_revealed,
  verificationStatus: row.verification_status,
  distributionStatus: row.distribution_status,
  sentAt: row.sent_at,
  canSendToLister: Boolean(row.lister_user_id),
  createdAt: row.created_at,
});

async function listLeads(query) {
  const [rows, total] = await Promise.all([repository.findLeads(query), repository.countLeads(query)]);

  return { items: rows.map(toLead), page: query.page, limit: query.limit, total };
}

function assertSendable(lead) {
  if (!lead) throw new AppError("Lead not found", 404);
  if (lead.verification_status !== "verified") throw new AppError("Only verified leads can be sent", 409);
  if (lead.distribution_status === "sent") throw new AppError("Lead already sent", 409);
  if (!lead.lister_user_id) throw new AppError("This lead has no user account to receive it", 422);
}

// Recipient is always the stored lister, never a client-supplied id
async function sendLeadToLister(id) {
  return db.transaction(async (trx) => {
    const lead = await repository.findLeadForUpdate(trx, id);
    assertSendable(lead);

    const sent = await repository.markLeadSent(trx, id);
    if (!sent) throw new AppError("Lead already sent", 409);

    await notificationRepository.insertNotification(
      trx,
      notificationTemplates.leadReceived({
        userId: lead.lister_user_id,
        propertyId: lead.property_id,
        leadId: lead.id,
        title: lead.property_title || "Your property",
      })
    );

    return { id: sent.id, distributionStatus: sent.distribution_status, sentAt: sent.sent_at };
  });
}

module.exports = { listLeads, sendLeadToLister };
