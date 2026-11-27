const express = require("express");
const validate = require("../../../../middlewares/validate.middleware");
const adminAuthMiddleware = require("../../../../middlewares/admin-auth.middleware");
const limelightController = require("./limelight-projects.controller");
const {
  searchQuerySchema,
  addProjectsSchema,
  reorderSchema,
  projectIdParamSchema,
} = require("./limelight-projects.validation");

function createProjectSelectionRouter(controller) {
  const router = express.Router();

  router.use(adminAuthMiddleware);

  router.get("/search", validate.validateQuery(searchQuerySchema), controller.searchProjects);
  router.get("/", controller.listEntries);
  router.post("/", validate(addProjectsSchema), controller.addProjects);
  router.put("/order", validate(reorderSchema), controller.saveOrder);
  router.delete("/:projectId", validate.validateParams(projectIdParamSchema), controller.removeProject);

  return router;
}

module.exports = createProjectSelectionRouter(limelightController);
module.exports.createProjectSelectionRouter = createProjectSelectionRouter;
