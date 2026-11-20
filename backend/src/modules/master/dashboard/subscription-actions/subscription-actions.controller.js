const service = require("./subscription-actions.service");

function handleError(res, error) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message, ...error.details });
  }

  console.error("Subscription actions error:", error);
  return res.status(500).json({ message: "Something went wrong. Please try again." });
}

const respond = (action, successStatus = 200) => async (req, res) => {
  try {
    return res.status(successStatus).json(await action(req));
  } catch (error) {
    return handleError(res, error);
  }
};

const giftCredits = respond(async (req) => ({
  message: "Credits added",
  ...(await service.giftCredits(req.admin, req.body)),
}), 201);
const extendSubscription = respond(async (req) => ({
  message: "Subscription extended",
  ...(await service.extendSubscription(req.admin, req.body)),
}));
const refundOrder = respond(async (req) => ({
  message: "Order refunded",
  ...(await service.refundOrder(req.admin, req.body)),
}));
const listActions = respond((req) => {
  const { userId, ...paging } = req.validatedQuery;
  return service.listActions(userId, paging);
});

module.exports = { giftCredits, extendSubscription, refundOrder, listActions };
