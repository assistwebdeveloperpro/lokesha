const service = require("./featured-projects.service");
const { createProjectSelectionController } = require("../limelight-projects/limelight-projects.controller");

module.exports = createProjectSelectionController(service);
