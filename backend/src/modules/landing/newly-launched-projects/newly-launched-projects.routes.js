const express = require("express");
const { validateQuery } = require("../../../middlewares/validate.middleware");
const controller = require("./newly-launched-projects.controller");
const { listQuerySchema } = require("./newly-launched-projects.validation");

const router = express.Router();

router.get("/", validateQuery(listQuerySchema), controller.listNewlyLaunchedProjects);

module.exports = router;
