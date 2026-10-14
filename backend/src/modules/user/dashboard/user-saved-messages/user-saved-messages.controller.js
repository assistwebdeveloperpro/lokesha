const service = require("./user-saved-messages.service");

function handleError(res, error) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.error("User saved messages module error:", error);
  return res.status(500).json({ message: "Something went wrong" });
}

async function getSavedMessages(req, res) {
  try {
    const savedMessages = await service.getSavedMessages(req.user.id);
    return res.status(200).json({ savedMessages });
  } catch (error) {
    return handleError(res, error);
  }
}

async function saveMessage(req, res) {
  try {
    const { category, message } = req.body;
    const savedMessages = await service.saveMessage(req.user.id, category, message);
    return res.status(200).json({ message: "Saved message updated successfully", savedMessages });
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = { getSavedMessages, saveMessage };
