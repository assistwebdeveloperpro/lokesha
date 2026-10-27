const service = require("./manage-properties.service");
const { handleError } = require("../../../landing/property/property.controller");

async function listProperties(req, res) {
  try {
    return res.status(200).json(await service.listProperties(req.validatedQuery));
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = { listProperties };
