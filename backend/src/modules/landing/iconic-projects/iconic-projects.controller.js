const service = require("./iconic-projects.service");

async function listIconicProjects(req, res) {
  try {
    return res.status(200).json(await service.listIconicProjects(req.validatedQuery));
  } catch (error) {
    console.error("Iconic projects module error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

module.exports = { listIconicProjects };
