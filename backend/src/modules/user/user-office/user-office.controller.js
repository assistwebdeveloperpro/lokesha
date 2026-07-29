const service = require("./user-office.service");

function handleError(res, error) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.error("User office module error:", error);
  return res.status(500).json({ message: "Something went wrong" });
}

async function saveOfficeDetails(req, res) {
  try {
    const officeDetails = await service.saveOfficeDetails(req.user.id, req.body);
    return res
      .status(200)
      .json({ message: "Office details saved successfully", officeDetails });
  } catch (error) {
    return handleError(res, error);
  }
}

async function getOfficeDetails(req, res) {
  try {
    const officeDetails = await service.getOfficeDetails(req.user.id);
    return res.status(200).json({ officeDetails });
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = { saveOfficeDetails, getOfficeDetails };
