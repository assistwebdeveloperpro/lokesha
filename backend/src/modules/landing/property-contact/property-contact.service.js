const { db } = require("../../../config/db");
const { AppError } = require("../../shared/property/utils/property.errors");
const repository = require("./property-contact.repository");
const adminNotifications = require("../../master/dashboard/admin-notifications/admin-notifications.service");

const FREE_CONTACT_LIMIT = 2;

const STAFF_LISTED_BY = ["lokesha_staff", "admin"];

function resolveLister(property) {
  if (STAFF_LISTED_BY.includes(property.listed_by) && property.owner_name) {
    // Real owner's name, but the staff/admin who listed it receives the enquiry
    const mobile = property.admin_mobile ?? property.user_mobile;
    // Leads page shows the real owner's number, falling back to the staff number
    return { name: property.owner_name, mobile, leadMobile: property.owner_mobile ?? mobile };
  }
  if (property.user_id) {
    return { name: property.user_name, mobile: property.user_mobile, leadMobile: property.user_mobile };
  }
  return { name: property.admin_name, mobile: property.admin_mobile, leadMobile: property.admin_mobile };
}

function buildResult(lister, phoneRevealed, revealedBefore) {
  return {
    contactName: lister.name,
    contactPhone: phoneRevealed ? lister.mobile : null,
    phoneRevealed,
    creditBalance: phoneRevealed ? Math.max(0, FREE_CONTACT_LIMIT - revealedBefore - 1) : 0,
    canSubscribe: !phoneRevealed,
  };
}

async function contactLister(userId, { propertyId, contactRole }) {
  const property = await repository.findPublishedPropertyWithLister(propertyId);
  if (!property) {
    throw new AppError("Property not found", 404);
  }

  if (property.user_id === userId) {
    throw new AppError("You cannot contact your own property", 400);
  }

  const user = await repository.findUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const lister = resolveLister(property);
  const hasPhone = Boolean(lister.mobile);

  return db.transaction(async (trx) => {
    await repository.lockUserLeads(userId, trx);

    const existing = await repository.findLead(userId, propertyId, trx);
    if (existing) {
      const revealedBefore = await repository.countRevealedLeads(userId, { before: existing.created_at, trx });
      return buildResult(lister, existing.phone_revealed && hasPhone, revealedBefore);
    }

    const revealedBefore = await repository.countRevealedLeads(userId, { trx });
    const phoneRevealed = hasPhone && revealedBefore < FREE_CONTACT_LIMIT;

    const lead = await repository.insertLead(
      {
        property_id: property.id,
        lead_user_id: user.id,
        lister_user_id: property.user_id,
        lister_admin_id: property.admin_id,
        lister_role: contactRole,
        phone_revealed: phoneRevealed,
        lead_name: user.name,
        lead_mobile: user.mobile_number,
        lead_email: user.email,
        lister_name: lister.name,
        lister_mobile: lister.leadMobile,
        lister_listed_by: property.listed_by,
      },
      trx
    );
    await adminNotifications.notifyLeadReceived(trx, {
      propertyId: property.id,
      leadId: lead.id,
      leadName: user.name,
    });

    return buildResult(lister, phoneRevealed, revealedBefore);
  });
}

async function listContactedPropertyIds(userId) {
  const propertyIds = await repository.findContactedPropertyIds(userId);
  return { propertyIds };
}

module.exports = { contactLister, listContactedPropertyIds, FREE_CONTACT_LIMIT };
