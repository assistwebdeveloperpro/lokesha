const service = require("../services/property.service");

const POSTGRES_ERROR_STATUS = {
  "23505": [409, "This record already exists"],
  "23503": [400, "A related record does not exist"],
  "23514": [400, "Some of the submitted values are not allowed"],
};

function handleError(res, error) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message, ...error.details });
  }

  console.error("Property module error:", error);

  const mapped = POSTGRES_ERROR_STATUS[error.code];
  if (mapped) {
    return res.status(mapped[0]).json({ message: mapped[1] });
  }

  return res.status(500).json({ message: "Something went wrong" });
}

async function listAmenityOptions(req, res) {
  try {
    const options = await service.listAmenityOptions(req.validatedQuery);
    return res.status(200).json(options);
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = {
  handleError,
  listAmenityOptions,
};
