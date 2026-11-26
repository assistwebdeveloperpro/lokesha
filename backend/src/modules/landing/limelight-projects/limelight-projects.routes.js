const express = require("express");
const { validateQuery } = require("../../../middlewares/validate.middleware");
const controller = require("./limelight-projects.controller");
const { listQuerySchema } = require("./limelight-projects.validation");

const router = express.Router();

router.get("/", validateQuery(listQuerySchema), controller.listLimelightProjects);

module.exports = router;
