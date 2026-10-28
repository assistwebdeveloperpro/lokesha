const propertyService = require("../../../shared/property/services/property.service");
const postPropertyRepository = require("./user-post-property.repository");
const { buildPropertyDetail } = require("../../../shared/property/services/property-read.service");
const { AppError } = require("../../../shared/property/utils/property.errors");

async function getMyProperty(user, propertyId) {
  const property = await postPropertyRepository.findOwnedProperty(propertyId, user.id);
  if (!property) {
    throw new AppError("Property not found", 404);
  }

  return buildPropertyDetail(property, user.role);
}

module.exports = {
  createDraft: propertyService.createDraft,
  listDrafts: propertyService.listDrafts,
  getDraft: propertyService.getDraft,
  saveDraft: propertyService.saveDraft,
  deleteDraft: propertyService.deleteDraft,
  completeDraft: propertyService.completeDraft,
  registerDraftFile: propertyService.registerDraftFile,
  removeDraftFile: propertyService.removeDraftFile,
  resolveDraftFile: propertyService.resolveDraftFile,
  getMyProperty,
  updateProperty: propertyService.updateProperty,
  addPropertyFile: propertyService.addPropertyFile,
  removeMedia: propertyService.removeMedia,
  removeFloorPlan: propertyService.removeFloorPlan,
};
