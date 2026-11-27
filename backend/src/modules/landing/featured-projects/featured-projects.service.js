const repository = require("./featured-projects.repository");
const { createProjectSelectionService } = require("../limelight-projects/limelight-projects.service");

const { listProjects } = createProjectSelectionService(repository);

module.exports = { listFeaturedProjects: listProjects };
