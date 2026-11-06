const service = require("./leads.service");

async function listLeads(req, res) {
  try {
    return res.status(200).json(await service.listLeads(req.validatedQuery));
  } catch (error) {
    console.error("Leads module error:", error);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

module.exports = { listLeads };
