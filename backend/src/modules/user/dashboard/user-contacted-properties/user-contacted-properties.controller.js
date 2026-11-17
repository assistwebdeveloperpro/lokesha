const service = require("./user-contacted-properties.service");

async function listContactedProperties(req, res) {
  try {
    const result = await service.listContactedProperties(req.user.id, req.query);
    return res.status(200).json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    console.error("User contacted properties module error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

module.exports = { listContactedProperties };
