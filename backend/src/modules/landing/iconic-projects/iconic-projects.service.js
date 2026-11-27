const repository = require("./iconic-projects.repository");
const { createProjectSelectionService } = require("../limelight-projects/limelight-projects.service");

const { listProjects } = createProjectSelectionService(repository);

module.exports = { listIconicProjects: listProjects };
