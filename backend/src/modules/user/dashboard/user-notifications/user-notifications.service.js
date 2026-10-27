const repository = require("./user-notifications.repository");
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

async function listNotifications(userId, { status, page, limit }) {
  const [rows, total, unreadCount] = await Promise.all([
    repository.findByUser(userId, { status, page, limit }),
    repository.countByUser(userId, status),
    repository.countByUser(userId, "unread"),
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

async function getUnreadCount(userId) {
  return { unreadCount: await repository.countByUser(userId, "unread") };
}

async function markAsRead(userId, notificationId) {
  const updated = await repository.markRead(notificationId, userId);
  if (!updated) {
    throw new AppError("Notification not found", 404);
  }

  return { id: updated.id, unreadCount: await repository.countByUser(userId, "unread") };
}

async function markAllAsRead(userId) {
  await repository.markAllRead(userId);
  return { unreadCount: 0 };
}

module.exports = { listNotifications, getUnreadCount, markAsRead, markAllAsRead };
