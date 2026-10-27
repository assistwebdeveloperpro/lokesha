const service = require("./user-notifications.service");

function handleError(res, error) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.error("User notifications module error:", error);
  return res.status(500).json({ message: "Something went wrong" });
}

const respond = (action) => async (req, res) => {
  try {
    return res.status(200).json(await action(req));
  } catch (error) {
    return handleError(res, error);
  }
};

const listNotifications = respond((req) => service.listNotifications(req.user.id, req.validatedQuery));
const getUnreadCount = respond((req) => service.getUnreadCount(req.user.id));
const markAsRead = respond((req) => service.markAsRead(req.user.id, req.params.id));

const markAllAsRead = respond((req) => service.markAllAsRead(req.user.id));

module.exports = { listNotifications, getUnreadCount, markAsRead, markAllAsRead };
