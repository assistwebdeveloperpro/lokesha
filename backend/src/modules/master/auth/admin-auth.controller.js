const adminAuthService = require("./admin-auth.service");

function handleError(res, error) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.error("Admin auth module error:", error);
  return res.status(500).json({ message: "Something went wrong" });
}

async function login(req, res) {
  try {
    const result = await adminAuthService.login(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

async function verifyOtp(req, res) {
  try {
    const result = await adminAuthService.verifyOtp(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

async function getMe(req, res) {
  try {
    const admin = await adminAuthService.getMe(req.admin.id);
    return res.status(200).json({ admin });
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = { login, verifyOtp, getMe };
