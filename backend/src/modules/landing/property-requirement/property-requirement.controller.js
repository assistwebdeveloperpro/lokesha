const service = require("./property-requirement.service");

async function createRequirement(req, res) {
  try {
    const requirement = await service.createRequirement(req.user.id, req.body);
    return res.status(201).json({ message: "Your requirement has been submitted", requirement });
  } catch (error) {
    console.error("Property requirement module error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

module.exports = { createRequirement };
