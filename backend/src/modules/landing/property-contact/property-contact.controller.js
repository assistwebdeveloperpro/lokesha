const service = require("./property-contact.service");

async function contactLister(req, res) {
  try {
    const result = await service.contactLister(req.user.id, req.body);
    return res.status(200).json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    console.error("Property contact module error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

async function listContacted(req, res) {
  try {
    const result = await service.listContactedPropertyIds(req.user.id);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Property contact module error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

module.exports = { contactLister, listContacted };
