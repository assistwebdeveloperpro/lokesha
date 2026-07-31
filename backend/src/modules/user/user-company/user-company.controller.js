const service = require("./user-company.service");

function handleError(res, error) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.error("User company module error:", error);
  return res.status(500).json({ message: "Something went wrong" });
}

async function saveBusinessDetails(req, res) {
  try {
    const businessDetails = await service.saveBusinessDetails(req.user.id, req.body);
    return res
      .status(200)
      .json({ message: "Business details saved successfully", businessDetails });
  } catch (error) {
    return handleError(res, error);
  }
}

async function getBusinessDetails(req, res) {
  try {
    const businessDetails = await service.getBusinessDetails(req.user.id);
    return res.status(200).json({ businessDetails });
  } catch (error) {
    return handleError(res, error);
  }
}

async function uploadCompanyLogo(req, res) {
  try {
    const businessDetails = await service.uploadCompanyLogo(req.user.id, req.file);
    return res
      .status(200)
      .json({ message: "Company logo uploaded successfully", businessDetails });
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = { saveBusinessDetails, getBusinessDetails, uploadCompanyLogo };
