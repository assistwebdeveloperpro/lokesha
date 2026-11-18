const service = require("./user-leads.service");

async function listLeads(req, res) {
  try {
    const result = await service.listLeads(req.user.id, req.validatedQuery);
    return res.status(200).json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    console.error("User leads module error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

module.exports = { listLeads };
