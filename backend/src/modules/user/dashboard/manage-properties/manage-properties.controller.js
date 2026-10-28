const service = require("./manage-properties.service");
const { handleError } = require("../../../shared/property/controllers/property.controller");

async function listMyProperties(req, res) {
  try {
    const result = await service.listMyProperties(req.user, req.validatedQuery);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

async function submitProperty(req, res) {
  try {
    const result = await service.submitProperty(req.user, req.params.id);
    const message = result.status === "published" ? "Property reopened successfully" : "Property submitted for review";
    return res.status(200).json({ message, ...result });
  } catch (error) {
    return handleError(res, error);
  }
}

async function closeProperty(req, res) {
  try {
    const result = await service.closeProperty(req.user, req.params.id);
    return res.status(200).json({ message: "Property closed successfully", ...result });
  } catch (error) {
    return handleError(res, error);
  }
}

async function deleteProperty(req, res) {
  try {
    await service.deleteProperty(req.user, req.params.id);
    return res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = {
  listMyProperties,
  submitProperty,
  closeProperty,
  deleteProperty,
};
