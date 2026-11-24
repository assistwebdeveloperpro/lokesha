const service = require("./saved-properties.service");

function handleError(res, error) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.error("User shortlisted properties module error:", error);
  return res.status(500).json({ message: "Something went wrong" });
}

async function listSavedProperties(req, res) {
  try {
    const result = await service.listSavedProperties(req.user.id, req.validatedQuery);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

async function listSavedPropertyIds(req, res) {
  try {
    const result = await service.listSavedPropertyIds(req.user.id);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

async function saveProperty(req, res) {
  try {
    const result = await service.saveProperty(req.user.id, req.body.propertyId);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

async function unsaveProperty(req, res) {
  try {
    const result = await service.unsaveProperty(req.user.id, req.params.propertyId);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = { listSavedProperties, listSavedPropertyIds, saveProperty, unsaveProperty };
