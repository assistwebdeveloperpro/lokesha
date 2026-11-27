const service = require("./iconic-projects.service");
const { createProjectSelectionController } = require("../limelight-projects/limelight-projects.controller");

module.exports = createProjectSelectionController(service);
