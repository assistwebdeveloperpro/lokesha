const service = require("./user-password.service");

function handleError(res, error) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.error("User password module error:", error);
  return res.status(500).json({ message: "Something went wrong" });
}

async function changePassword(req, res) {
  try {
    const result = await service.changePassword(req.user.id, req.body);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = { changePassword };
