const propertyService = require("../../../landing/property/property.service");
const { getPropertyForAdmin } = require("../../../landing/property/property-read.service");

const toCaller = (admin) => ({ adminId: admin.id, role: "admin" });

const withCaller =
  (action) =>
  (admin, ...args) =>
    action(toCaller(admin), ...args);

module.exports = {
  createDraft: withCaller(propertyService.createDraft),
  listDrafts: withCaller(propertyService.listDrafts),
  getDraft: withCaller(propertyService.getDraft),
  saveDraft: withCaller(propertyService.saveDraft),
  deleteDraft: withCaller(propertyService.deleteDraft),
  completeDraft: withCaller(propertyService.completeDraft),
  registerDraftFile: withCaller(propertyService.registerDraftFile),
  removeDraftFile: withCaller(propertyService.removeDraftFile),
  resolveDraftFile: withCaller(propertyService.resolveDraftFile),
  updateProperty: withCaller(propertyService.updateProperty),
  publishProperty: withCaller(propertyService.submitProperty),
  closeProperty: withCaller(propertyService.closeProperty),
  deleteProperty: withCaller(propertyService.deleteProperty),
  addPropertyFile: withCaller(propertyService.addPropertyFile),
  removeMedia: withCaller(propertyService.removeMedia),
  removeFloorPlan: withCaller(propertyService.removeFloorPlan),
  getProperty: (admin, propertyId) => getPropertyForAdmin(propertyId),
};
