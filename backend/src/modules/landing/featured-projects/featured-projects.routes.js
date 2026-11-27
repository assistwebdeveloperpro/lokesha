const express = require("express");
const { validateQuery } = require("../../../middlewares/validate.middleware");
const controller = require("./featured-projects.controller");
const { listQuerySchema } = require("./featured-projects.validation");

const router = express.Router();

router.get("/", validateQuery(listQuerySchema), controller.listFeaturedProjects);

module.exports = router;
