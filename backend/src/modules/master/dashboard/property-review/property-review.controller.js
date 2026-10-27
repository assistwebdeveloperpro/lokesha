const service = require("./property-review.service");

function handleError(res, error) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message, ...error.details });
  }

  console.error("Property review error:", error);
  return res.status(500).json({ message: "Something went wrong. Please try again." });
}

const respond = (action, successStatus = 200) => async (req, res) => {
  try {
    return res.status(successStatus).json(await action(req));
  } catch (error) {
    return handleError(res, error);
  }
};

const listProperties = respond((req) => service.listProperties(req.validatedQuery));
const getProperty = respond((req) => service.getProperty(req.params.id));
const approveProperty = respond((req) => service.approveProperty(req.admin, req.params.id));
const rejectProperty = respond((req) => service.rejectProperty(req.admin, req.params.id, req.body));

module.exports = { listProperties, getProperty, approveProperty, rejectProperty };
