const { db } = require("../../../../config/db");
const reviewRepository = require("./property-review.repository");
const readRepository = require("../../../landing/property/property-read.repository");
const { buildPropertyDetail } = require("../../../landing/property/property-read.service");
const { changeStatus } = require("../../../landing/property/property-status.service");
const mapper = require("../../../landing/property/property.mapper");
const { PROPERTY_TYPE_TO_DB } = require("../../../landing/property/property.constants");
const { AppError } = require("../../../landing/property/property.errors");
const notificationRepository = require("../../../user/dashboard/user-notifications/user-notifications.repository");
const notificationTemplates = require("../../../user/dashboard/user-notifications/user-notifications.templates");

const toOwner = (row) => ({ name: row.owner_name, email: row.owner_email, mobile: row.owner_mobile });

async function listProperties(query) {
  const filters = {
    ...query,
    propertyType: query.propertyType ? PROPERTY_TYPE_TO_DB[query.propertyType] : undefined,
  };

  const [rows, total] = await Promise.all([reviewRepository.findListings(filters), reviewRepository.countListings(filters)]);
  const images = await readRepository.findImagesByPropertyIds(rows.flatMap((row) => row.member_ids));
  const imagesByProperty = mapper.groupBy(images, "property_id");

  return {
    items: rows.map((row) => ({
      ...mapper.toListItem(row, mapper.collectRowImages(row, imagesByProperty)),
      owner: toOwner(row),
    })),
    page: query.page,
    limit: query.limit,
    total,
  };
}

async function getProperty(propertyId) {
  const property = await reviewRepository.findPropertyWithOwner(propertyId);
  if (!property) {
    throw new AppError("Property not found", 404);
  }

  const detail = await buildPropertyDetail(property, property.owner_role);
  return { ...detail, owner: toOwner(property) };
}

async function decide(admin, propertyId, { to, reason }) {
  return db.transaction(async (trx) => {
    const [property, ...siblings] = await reviewRepository.findGroupForUpdate(trx, propertyId);
    if (!property) {
      throw new AppError("Property not found", 404);
    }

    // Every sub type of the post is decided together; only a listing waiting for review can be decided, else 409
    for (const member of [property, ...siblings]) {
      await changeStatus(trx, {
        propertyId: member.id,
        from: member.status,
        to,
        actor: { adminId: admin.id },
        reason,
      });
    }

    // Saved in the same transaction, so the owner is told only about a decision that was stored
    const notification = to === "published" ? notificationTemplates.propertyApproved : notificationTemplates.propertyRejected;
    await notificationRepository.insertNotification(
      trx,
      notification({ userId: property.user_id, propertyId, title: property.title, reason })
    );
    return { id: propertyId, status: to };
  });
}

async function approveProperty(admin, propertyId) {
  const result = await decide(admin, propertyId, { to: "published" });
  return { message: "Property approved", ...result };
}

async function rejectProperty(admin, propertyId, { reason }) {
  const result = await decide(admin, propertyId, { to: "rejected", reason });
  return { message: "Property rejected", ...result };
}

module.exports = { listProperties, getProperty, approveProperty, rejectProperty };
