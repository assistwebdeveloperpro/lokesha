const service = require("./subscription-users.service");

function handleError(res, error) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message, ...error.details });
  }

  console.error("Subscription users error:", error);
  return res.status(500).json({ message: "Something went wrong. Please try again." });
}

const respond = (action) => async (req, res) => {
  try {
    return res.status(200).json(await action(req));
  } catch (error) {
    return handleError(res, error);
  }
};

const listUsers = respond((req) => service.listUsers(req.validatedQuery));
const getUserDetail = respond((req) => service.getUserDetail(req.params.id));
const listUserHistory = respond((req) => service.listUserHistory(req.params.id, req.validatedQuery));
const listUserPayments = respond((req) => service.listUserPayments(req.params.id, req.validatedQuery));
const listUserLedger = respond((req) => service.listUserLedger(req.params.id, req.validatedQuery));

module.exports = { listUsers, getUserDetail, listUserHistory, listUserPayments, listUserLedger };
