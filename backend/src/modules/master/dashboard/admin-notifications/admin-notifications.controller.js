const service = require("./admin-notifications.service");

function handleError(res, error) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.error("Admin notifications module error:", error);
  return res.status(500).json({ message: "Something went wrong" });
}

const respond = (action) => async (req, res) => {
  try {
    return res.status(200).json(await action(req));
  } catch (error) {
    return handleError(res, error);
  }
};

const listNotifications = respond((req) => service.listNotifications(req.validatedQuery));
const getUnreadCount = respond(() => service.getUnreadCount());
const markAsRead = respond((req) => service.markAsRead(req.params.id));

const markAllAsRead = respond(() => service.markAllAsRead());

module.exports = { listNotifications, getUnreadCount, markAsRead, markAllAsRead };
