const fs = require("fs/promises");
const repository = require("../modules/landing/property/property.repository");
const editRepository = require("../modules/landing/property/property-edit.repository");
const { buildErrorResponse } = require("./validate.middleware");

// Runs before multer so a file can never be written into another user's draft folder
async function assertOwnedDraft(req, res, next) {
  try {
    const exists = await repository.draftExistsForOwner(req.params.id, { userId: req.user.id });
    if (!exists) {
      return res.status(404).json({ message: "Draft not found" });
    }
    return next();
  } catch (error) {
    console.error("Property middleware error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

// Same guard for posted listings; the file is written to the property folder by multer
async function assertOwnedProperty(req, res, next) {
  try {
    const exists = await editRepository.propertyExistsForOwner(req.params.id, req.user.id);
    if (!exists) {
      return res.status(404).json({ message: "Property not found" });
    }
    return next();
  } catch (error) {
    console.error("Property middleware error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

// Validates the multipart fields and removes the stored file when they are invalid
function validateUploadedFile(schema) {
  return async (req, res, next) => {
    const { error, value } = schema.validate(req.body ?? {}, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (!error) {
      req.body = value;
      return next();
    }

    if (req.file) {
      await fs.rm(req.file.path, { force: true });
    }
    return res.status(400).json(buildErrorResponse(error));
  };
}

module.exports = { assertOwnedDraft, assertOwnedProperty, validateUploadedFile };
