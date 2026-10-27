const service = require("./property.service");

const POSTGRES_ERROR_STATUS = {
  "23505": [409, "This record already exists"],
  "23503": [400, "A related record does not exist"],
  "23514": [400, "Some of the submitted values are not allowed"],
};

function handleError(res, error) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message, ...error.details });
  }

  console.error("Property module error:", error);

  const mapped = POSTGRES_ERROR_STATUS[error.code];
  if (mapped) {
    return res.status(mapped[0]).json({ message: mapped[1] });
  }

  return res.status(500).json({ message: "Something went wrong" });
}

async function createDraft(req, res) {
  try {
    const draft = await service.createDraft(req.user, req.body);
    return res.status(201).json({ draft });
  } catch (error) {
    return handleError(res, error);
  }
}

async function listDrafts(req, res) {
  try {
    const drafts = await service.listDrafts(req.user);
    return res.status(200).json({ drafts });
  } catch (error) {
    return handleError(res, error);
  }
}

async function getDraft(req, res) {
  try {
    const draft = await service.getDraft(req.user, req.params.id);
    return res.status(200).json({ draft });
  } catch (error) {
    return handleError(res, error);
  }
}

async function saveDraft(req, res) {
  try {
    const draft = await service.saveDraft(req.user, req.params.id, req.body);
    return res.status(200).json({ draft });
  } catch (error) {
    return handleError(res, error);
  }
}

async function deleteDraft(req, res) {
  try {
    await service.deleteDraft(req.user, req.params.id);
    return res.status(200).json({ message: "Draft deleted successfully" });
  } catch (error) {
    return handleError(res, error);
  }
}

async function completeDraft(req, res) {
  try {
    const result = await service.completeDraft(req.user, req.params.id, req.body);
    return res.status(201).json({ message: "Property posted successfully", ...result });
  } catch (error) {
    return handleError(res, error);
  }
}

async function listAmenityOptions(req, res) {
  try {
    const options = await service.listAmenityOptions(req.validatedQuery);
    return res.status(200).json(options);
  } catch (error) {
    return handleError(res, error);
  }
}

async function listMyProperties(req, res) {
  try {
    const result = await service.listMyProperties(req.user, req.validatedQuery);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

async function getMyProperty(req, res) {
  try {
    const result = await service.getMyProperty(req.user, req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

async function updateProperty(req, res) {
  try {
    const result = await service.updateProperty(req.user, req.params.id, req.body);
    return res.status(200).json({ message: "Property updated successfully", ...result });
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

function createPropertyFileUploader(resolveKind) {
  return async (req, res) => {
    try {
      const result = await service.addPropertyFile(req.user, req.params.id, {
        file: req.file,
        kind: resolveKind(req),
        meta: req.body,
      });
      return res.status(201).json(result);
    } catch (error) {
      return handleError(res, error);
    }
  };
}

const uploadPropertyMedia = createPropertyFileUploader((req) => req.validatedQuery.kind);
const uploadPropertyFloorPlan = createPropertyFileUploader(() => "floor-plan");

async function deleteMedia(req, res) {
  try {
    const result = await service.removeMedia(req.user, req.params.id, req.params.mediaId);
    return res.status(200).json({ message: "File deleted successfully", ...result });
  } catch (error) {
    return handleError(res, error);
  }
}

async function deleteFloorPlan(req, res) {
  try {
    const result = await service.removeFloorPlan(req.user, req.params.id, req.params.planId);
    return res.status(200).json({ message: "Floor plan deleted successfully", ...result });
  } catch (error) {
    return handleError(res, error);
  }
}

async function uploadDraftFile(req, res) {
  try {
    const file = await service.registerDraftFile(req.user, req.params.id, {
      file: req.file,
      kind: req.validatedQuery.kind,
      meta: req.body,
    });
    return res.status(201).json({ file });
  } catch (error) {
    return handleError(res, error);
  }
}

async function deleteDraftFile(req, res) {
  try {
    await service.removeDraftFile(req.user, req.params.id, req.params.fileName);
    return res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    return handleError(res, error);
  }
}

async function streamDraftFile(req, res) {
  try {
    const filePath = await service.resolveDraftFile(req.user, req.params.id, req.params.fileName);
    res.set("Cache-Control", "private, max-age=3600");
    return res.sendFile(filePath, { dotfiles: "deny" }, (error) => {
      if (error && !res.headersSent) {
        handleError(res, error);
      }
    });
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = {
  createDraft,
  listDrafts,
  getDraft,
  saveDraft,
  deleteDraft,
  completeDraft,
  listAmenityOptions,
  listMyProperties,
  getMyProperty,
  updateProperty,
  submitProperty,
  closeProperty,
  deleteProperty,
  uploadPropertyMedia,
  uploadPropertyFloorPlan,
  deleteMedia,
  deleteFloorPlan,
  uploadDraftFile,
  deleteDraftFile,
  streamDraftFile,
};
