const controller = require("./iconic-projects.controller");
const { createProjectSelectionRouter } = require("../limelight-projects/limelight-projects.routes");

module.exports = createProjectSelectionRouter(controller);
