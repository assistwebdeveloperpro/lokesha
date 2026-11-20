const service = require("./subscription-settings.service");

function handleError(res, error) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message, ...error.details });
  }

  console.error("Subscription settings error:", error);
  return res.status(500).json({ message: "Something went wrong. Please try again." });
}

const respond = (action) => async (req, res) => {
  try {
    return res.status(200).json(await action(req));
  } catch (error) {
    return handleError(res, error);
  }
};

const getSettings = respond(() => service.getSettings());
const updateSettings = respond(async (req) => ({
  message: "Settings saved. New invoices will use these details.",
  settings: await service.updateSettings(req.body),
}));

module.exports = { getSettings, updateSettings };
