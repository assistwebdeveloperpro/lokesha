const service = require("./recent-searches.service");

function handleError(res, error) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.error("User recent searches module error:", error);
  return res.status(500).json({ message: "Something went wrong" });
}

async function recordSearch(req, res) {
  try {
    const item = await service.recordSearch(req.user.id, req.body);
    return res.status(200).json({ item });
  } catch (error) {
    return handleError(res, error);
  }
}

async function syncSearches(req, res) {
  try {
    await service.syncSearches(req.user.id, req.body.searches);
    return res.status(200).json({
      success: true,
      message: "Recent searches synchronized successfully.",
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function listSearches(req, res) {
  try {
    const result = await service.listSearches(req.user.id, req.validatedQuery);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

async function deleteSearch(req, res) {
  try {
    await service.deleteSearch(req.user.id, req.params.id);
    return res.status(200).json({ success: true });
  } catch (error) {
    return handleError(res, error);
  }
}

async function clearSearches(req, res) {
  try {
    await service.clearSearches(req.user.id);
    return res.status(200).json({ success: true });
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = { recordSearch, syncSearches, listSearches, deleteSearch, clearSearches };
