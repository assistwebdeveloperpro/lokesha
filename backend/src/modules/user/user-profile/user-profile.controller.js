const service = require("./user-profile.service");

function handleError(res, error) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.error("User profile module error:", error);
  return res.status(500).json({ message: "Something went wrong" });
}

async function getProfile(req, res) {
  try {
    const profile = await service.getProfile(req.user.id);
    return res.status(200).json({ profile });
  } catch (error) {
    return handleError(res, error);
  }
}

async function updateLoginDetails(req, res) {
  try {
    const profile = await service.updateLoginDetails(req.user.id, req.body);
    return res.status(200).json({ message: "Login details updated successfully", profile });
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = { getProfile, updateLoginDetails };
