const service = require("./popular-projects.service");

async function listPopularProjects(req, res) {
  try {
    return res.status(200).json(await service.listPopularProjects(req.validatedQuery));
  } catch (error) {
    console.error("Popular projects module error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

module.exports = { listPopularProjects };
