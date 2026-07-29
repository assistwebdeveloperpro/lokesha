const authService = require("./auth.service");

function handleError(res, error) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.error("Auth module error:", error);
  return res.status(500).json({ message: "Something went wrong" });
}

async function signup(req, res) {
  try {
    const user = await authService.signup(req.body);
    return res.status(201).json({ message: "Signup successful", user });
  } catch (error) {
    return handleError(res, error);
  }
}

async function login(req, res) {
  try {
    const result = await authService.login(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

async function verifyOtp(req, res) {
  try {
    const result = await authService.verifyOtp(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

async function getMe(req, res) {
  try {
    const user = await authService.getMe(req.user.id);
    return res.status(200).json({ user });
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = { signup, login, verifyOtp, getMe };
