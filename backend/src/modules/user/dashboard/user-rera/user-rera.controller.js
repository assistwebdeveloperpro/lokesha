const service = require("./user-rera.service");

function handleError(res, error) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.error("User rera module error:", error);
  return res.status(500).json({ message: "Something went wrong" });
}

async function getReraDetails(req, res) {
  try {
    const reraDetails = await service.listReraDetails(req.user.id);
    return res.status(200).json({ reraDetails });
  } catch (error) {
    return handleError(res, error);
  }
}

async function createReraDetail(req, res) {
  try {
    const reraDetail = await service.createReraDetail(req.user.id, req.body, req.file);
    return res
      .status(201)
      .json({ message: "RERA details added successfully", reraDetail });
  } catch (error) {
    return handleError(res, error);
  }
}

async function updateReraDetail(req, res) {
  try {
    const reraDetail = await service.updateReraDetail(
      req.user.id,
      req.params.id,
      req.body,
      req.file
    );
    return res
      .status(200)
      .json({ message: "RERA details updated successfully", reraDetail });
  } catch (error) {
    return handleError(res, error);
  }
}

async function deleteReraDetail(req, res) {
  try {
    await service.deleteReraDetail(req.user.id, req.params.id);
    return res.status(200).json({ message: "RERA details deleted successfully" });
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = { getReraDetails, createReraDetail, updateReraDetail, deleteReraDetail };
