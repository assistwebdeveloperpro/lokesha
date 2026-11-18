const service = require("./leads.service");

function handleError(res, error) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.error("Leads module error:", error);
  return res.status(500).json({ message: "Something went wrong. Please try again." });
}

async function listLeads(req, res) {
  try {
    return res.status(200).json(await service.listLeads(req.validatedQuery));
  } catch (error) {
    return handleError(res, error);
  }
}

async function sendLead(req, res) {
  try {
    return res.status(200).json(await service.sendLeadToLister(req.params.id));
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = { listLeads, sendLead };
