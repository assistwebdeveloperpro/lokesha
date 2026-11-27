const repository = require("./featured-projects.repository");
const { createProjectSelectionService } = require("../limelight-projects/limelight-projects.service");

module.exports = createProjectSelectionService({ repository, name: "Featured Projects" });
