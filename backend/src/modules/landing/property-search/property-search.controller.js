const service = require("./property-search.service");

function handleError(res, error) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.error("Property search module error:", error);
  return res.status(500).json({ message: "Something went wrong" });
}

async function searchProperties(req, res) {
  try {
    return res.status(200).json(await service.searchProperties(req.validatedQuery));
  } catch (error) {
    return handleError(res, error);
  }
}

async function getPropertyDetails(req, res) {
  try {
    return res.status(200).json({ property: await service.getPropertyDetails(req.params.id) });
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = { searchProperties, getPropertyDetails };
