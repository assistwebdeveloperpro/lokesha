const { createProjectSelectionRepository } = require("../limelight-projects/limelight-projects.repository");

module.exports = createProjectSelectionRepository({ table: "featured_projects" });
