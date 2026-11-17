const service = require("./seen-properties.service");

function handleError(res, error) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.error("User seen properties module error:", error);
  return res.status(500).json({ message: "Something went wrong" });
}

async function recordView(req, res) {
  try {
    const result = await service.recordView(req.user?.id, req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

async function syncViews(req, res) {
  try {
    await service.syncViews(req.user.id, req.body.properties);
    return res.status(200).json({
      success: true,
      message: "Recently viewed properties synchronized successfully.",
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function listViewedProperties(req, res) {
  try {
    const result = await service.listViewedProperties(req.user.id, req.validatedQuery);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = { recordView, syncViews, listViewedProperties };
