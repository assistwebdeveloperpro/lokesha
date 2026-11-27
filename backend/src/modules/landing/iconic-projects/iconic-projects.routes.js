const express = require("express");
const { validateQuery } = require("../../../middlewares/validate.middleware");
const controller = require("./iconic-projects.controller");
const { listQuerySchema } = require("./iconic-projects.validation");

const router = express.Router();

router.get("/", validateQuery(listQuerySchema), controller.listIconicProjects);

module.exports = router;
