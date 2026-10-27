const service = require("./admin-post-property.service");
const { handleError } = require("../../../landing/property/property.controller");

const respond = (action, successStatus = 200) => async (req, res) => {
  try {
    return res.status(successStatus).json(await action(req));
  } catch (error) {
    return handleError(res, error);
  }
};

const createDraft = respond(async (req) => ({ draft: await service.createDraft(req.admin, req.body) }), 201);
const listDrafts = respond(async (req) => ({ drafts: await service.listDrafts(req.admin) }));
const getDraft = respond(async (req) => ({ draft: await service.getDraft(req.admin, req.params.id) }));
const saveDraft = respond(async (req) => ({ draft: await service.saveDraft(req.admin, req.params.id, req.body) }));

const deleteDraft = respond(async (req) => {
  await service.deleteDraft(req.admin, req.params.id);
  return { message: "Draft deleted successfully" };
});

const completeDraft = respond(async (req) => {
  const result = await service.completeDraft(req.admin, req.params.id, req.body);
  return { message: req.body.submit ? "Property published successfully" : "Property saved as draft", ...result };
}, 201);

const getProperty = respond((req) => service.getProperty(req.admin, req.params.id));

const updateProperty = respond(async (req) => {
  const result = await service.updateProperty(req.admin, req.params.id, req.body);
  return { message: "Property updated successfully", ...result };
});

const publishProperty = respond(async (req) => {
  const result = await service.publishProperty(req.admin, req.params.id);
  return { message: "Property published successfully", ...result };
});

const closeProperty = respond(async (req) => {
  const result = await service.closeProperty(req.admin, req.params.id);
  return { message: "Property closed successfully", ...result };
});

const createFileUploader = (resolveKind) =>
  respond(
    (req) =>
      service.addPropertyFile(req.admin, req.params.id, {
        file: req.file,
        kind: resolveKind(req),
        meta: req.body,
      }),
    201
  );

const uploadPropertyMedia = createFileUploader((req) => req.validatedQuery.kind);
const uploadPropertyFloorPlan = createFileUploader(() => "floor-plan");

const deleteMedia = respond(async (req) => {
  const result = await service.removeMedia(req.admin, req.params.id, req.params.mediaId);
  return { message: "File deleted successfully", ...result };
});

const deleteFloorPlan = respond(async (req) => {
  const result = await service.removeFloorPlan(req.admin, req.params.id, req.params.planId);
  return { message: "Floor plan deleted successfully", ...result };
});

const uploadDraftFile = respond(
  async (req) => ({
    file: await service.registerDraftFile(req.admin, req.params.id, {
      file: req.file,
      kind: req.validatedQuery.kind,
      meta: req.body,
    }),
  }),
  201
);

const deleteDraftFile = respond(async (req) => {
  await service.removeDraftFile(req.admin, req.params.id, req.params.fileName);
  return { message: "File deleted successfully" };
});

async function streamDraftFile(req, res) {
  try {
    const filePath = await service.resolveDraftFile(req.admin, req.params.id, req.params.fileName);
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
  getProperty,
  updateProperty,
  publishProperty,
  closeProperty,
  uploadPropertyMedia,
  uploadPropertyFloorPlan,
  deleteMedia,
  deleteFloorPlan,
  uploadDraftFile,
  deleteDraftFile,
  streamDraftFile,
};
