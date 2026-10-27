const repository = require("./admin-notifications.repository");
const templates = require("./admin-notifications.templates");
const readRepository = require("../../../landing/property/property-read.repository");
const { pickMainImage, groupBy } = require("../../../landing/property/property.mapper");
const { AppError } = require("../../../landing/property/property.errors");

function toNotification(row, images) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    propertyId: row.property_id,
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

async function listNotifications({ status, page, limit }) {
  const [rows, total, unreadCount] = await Promise.all([
    repository.findAll({ status, page, limit }),
    repository.countAll(status),
    repository.countAll("unread"),
  ]);

  const propertyIds = [...new Set(rows.flatMap((row) => row.property_id ?? []))];
  const images = await readRepository.findImagesByPropertyIds(propertyIds);
  const imagesByProperty = groupBy(images, "property_id");

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

module.exports = { notifyPropertyPending, listNotifications, getUnreadCount, markAsRead, markAllAsRead };
