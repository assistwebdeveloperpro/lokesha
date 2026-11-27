const service = require("./featured-projects.service");

async function listFeaturedProjects(req, res) {
  try {
    return res.status(200).json(await service.listFeaturedProjects(req.validatedQuery));
  } catch (error) {
    console.error("Featured projects module error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

module.exports = { listFeaturedProjects };
