const express = require("express");
const { validateQuery } = require("../../../middlewares/validate.middleware");
const controller = require("./popular-projects.controller");
const { listQuerySchema } = require("./popular-projects.validation");

const router = express.Router();

router.get("/", validateQuery(listQuerySchema), controller.listPopularProjects);

module.exports = router;
