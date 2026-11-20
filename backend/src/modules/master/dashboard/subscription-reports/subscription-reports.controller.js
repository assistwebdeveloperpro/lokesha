const service = require("./subscription-reports.service");

async function getOverview(req, res) {
  try {
    return res.status(200).json(await service.getOverview(req.validatedQuery));
  } catch (error) {
    console.error("Subscription reports error:", error);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

module.exports = { getOverview };
