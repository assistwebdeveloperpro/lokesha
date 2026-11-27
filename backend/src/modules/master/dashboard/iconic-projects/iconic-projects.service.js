const repository = require("./iconic-projects.repository");
const { createProjectSelectionService } = require("../limelight-projects/limelight-projects.service");

module.exports = createProjectSelectionService({ repository, name: "Iconic Projects" });
