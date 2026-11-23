const repository = require("./admin-notifications.repository");
const templates = require("./admin-notifications.templates");
const readRepository = require("../../../shared/property/repositories/property-read.repository");
const { pickMainImage, groupBy } = require("../../../shared/property/mappers/property.mapper");
const { AppError } = require("../../../shared/property/utils/property.errors");

function toNotification(row, images) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    propertyId: row.property_id,
    leadId: row.lead_id,
    image: pickMainImage(images),
    isRead: row.read_at !== null,
    createdAt: row.created_at,
  };
}

// Runs in the caller's transaction; a published listing coming back is an owner edit
async function notifyPropertyPending(trx, { propertyId, from }) {
  const property = await trx("properties").where({ id: propertyId }).first("title");
  if (!property) return;

  const template = from === "published" ? templates.propertyResubmitted : templates.propertySubmitted;
  await repository.insertNotification(trx, template({ propertyId, title: property.title }));
}

// Runs in the payment transaction, so admins hear only about a purchase that was saved
async function notifySubscriptionPurchased(trx, { userId, listings, months, orderNumber }) {
  const user = await trx("users").where({ id: userId }).first("name");
  await repository.insertNotification(
    trx,
    templates.subscriptionPurchased({ userName: user?.name ?? "A user", listings, months, orderNumber })
  );
}

// Runs in the payment transaction, so admins hear only about a lead purchase that was saved
async function notifyLeadPackPurchased(trx, { userId, propertyId, leads, orderNumber }) {
  const [user, property] = await Promise.all([
    trx("users").where({ id: userId }).first("name"),
    trx("properties").where({ id: propertyId }).first("title"),
  ]);

  await repository.insertNotification(
    trx,
    templates.leadPackPurchased({
      userName: user?.name ?? "A user",
      propertyId,
      title: property?.title ?? "A property",
      leads,
      orderNumber,
    })
  );
}

// Runs in the contact transaction, so admins hear only about a lead that was saved
async function notifyLeadReceived(trx, { propertyId, leadId, leadName }) {
  const property = await trx("properties as p")
    .leftJoin("builder_projects as bp", "bp.id", "p.builder_project_id")
    .where("p.id", propertyId)
    .first(trx.raw("coalesce(bp.project_name, p.title) as title"));

  await repository.insertNotification(
    trx,
    templates.leadReceived({ propertyId, leadId, title: property?.title ?? "A property", leadName })
  );
}

async function listNotifications({ status, page, limit }) {
  const [rows, total, unreadCount] = await Promise.all([
    repository.findAll({ status, page, limit }),
    repository.countAll(status),
    repository.countAll("unread"),
  ]);

  const propertyIds = [...new Set(rows.flatMap((row) => row.property_id ?? []))];
  const images = await readRepository.findGroupImagesByPropertyIds(propertyIds);
  const imagesByProperty = groupBy(images, "source_id");

  return {
    items: rows.map((row) => toNotification(row, imagesByProperty[row.property_id])),
    page,
    limit,
    total,
    unreadCount,
  };
}

async function getUnreadCount() {
  return { unreadCount: await repository.countAll("unread") };
}

async function markAsRead(notificationId) {
  const updated = await repository.markRead(notificationId);
  if (!updated) {
    throw new AppError("Notification not found", 404);
  }

  return { id: updated.id, unreadCount: await repository.countAll("unread") };
}

async function markAllAsRead() {
  await repository.markAllRead();
  return { unreadCount: 0 };
}

module.exports = {
  notifyPropertyPending,
  notifySubscriptionPurchased,
  notifyLeadPackPurchased,
  notifyLeadReceived,
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
