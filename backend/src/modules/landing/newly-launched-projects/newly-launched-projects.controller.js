const service = require("./newly-launched-projects.service");

async function listNewlyLaunchedProjects(req, res) {
  try {
    return res.status(200).json(await service.listNewlyLaunchedProjects(req.validatedQuery));
  } catch (error) {
    console.error("Newly launched projects module error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

module.exports = { listNewlyLaunchedProjects };
