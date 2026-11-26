const service = require("./limelight-projects.service");

async function listLimelightProjects(req, res) {
  try {
    return res.status(200).json(await service.listLimelightProjects(req.validatedQuery));
  } catch (error) {
    console.error("Limelight projects module error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

module.exports = { listLimelightProjects };
