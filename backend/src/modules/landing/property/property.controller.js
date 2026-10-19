const service = require("./property.service");

function handleError(res, error) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.error("Property module error:", error);
  return res.status(500).json({ message: "Something went wrong" });
}

async function createProperty(req, res) {
  try {
    const property = await service.createProperty(req.user.id, req.body, req.files);
    return res.status(201).json({ message: "Property posted successfully", property });
  } catch (error) {
    return handleError(res, error);
  }
}

async function listPublished(req, res) {
  try {
    return res.status(200).json(await service.listPublished(req.query));
  } catch (error) {
    return handleError(res, error);
  }
}

async function listMine(req, res) {
  try {
    return res.status(200).json(await service.listMine(req.user.id, req.query));
  } catch (error) {
    return handleError(res, error);
  }
}

async function listCatalogAmenities(req, res) {
  try {
    return res.status(200).json(await service.listCatalogAmenities(req.query));
  } catch (error) {
    return handleError(res, error);
  }
}

async function getProperty(req, res) {
  try {
    const property = await service.getProperty(req.params.id, req.user?.id);
    return res.status(200).json({ property });
  } catch (error) {
    return handleError(res, error);
  }
}

async function updateProperty(req, res) {
  try {
    const property = await service.updateProperty(req.params.id, req.user.id, req.body);
    return res.status(200).json({ message: "Property updated successfully", property });
  } catch (error) {
    return handleError(res, error);
  }
}

async function addMedia(req, res) {
  try {
    const property = await service.addMedia(req.params.id, req.user.id, req.body, req.files);
    return res.status(200).json({ message: "Media uploaded successfully", property });
  } catch (error) {
    return handleError(res, error);
  }
}

async function deleteMedia(req, res) {
  try {
    await service.deleteMedia(req.params.id, req.params.mediaId, req.user.id);
    return res.status(200).json({ message: "Media deleted successfully" });
  } catch (error) {
    return handleError(res, error);
  }
}

async function deleteProperty(req, res) {
  try {
    await service.deleteProperty(req.params.id, req.user.id);
    return res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = {
  createProperty,
  listPublished,
  listMine,
  listCatalogAmenities,
  getProperty,
  updateProperty,
  addMedia,
  deleteMedia,
  deleteProperty,
};
