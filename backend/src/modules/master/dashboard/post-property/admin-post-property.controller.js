const service = require("./admin-post-property.service");

function handleError(res, error) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.error("Admin post property error:", error);
  return res.status(500).json({ message: "Something went wrong" });
}

async function createProperty(req, res) {
  try {
    const property = await service.createProperty(req.admin.id, req.body, req.files);
    return res.status(201).json({ message: "Property posted successfully", property });
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = { createProperty };
