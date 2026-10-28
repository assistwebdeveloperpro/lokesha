const service = require("./user-post-property.service");
const { handleError, listAmenityOptions } = require("../../../shared/property/controllers/property.controller");

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
  getMyProperty,
  updateProperty,
  uploadPropertyMedia,
  uploadPropertyFloorPlan,
  deleteMedia,
  deleteFloorPlan,
  uploadDraftFile,
  deleteDraftFile,
  streamDraftFile,
};
