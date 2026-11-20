const service = require("./subscription-packages.service");

function handleError(res, error) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message, ...error.details });
  }

  console.error("Subscription packages error:", error);
  return res.status(500).json({ message: "Something went wrong. Please try again." });
}

const respond = (action, successStatus = 200) => async (req, res) => {
  try {
    return res.status(successStatus).json(await action(req));
  } catch (error) {
    return handleError(res, error);
  }
};

const listPackages = respond(() => service.listPackages());
const getPackage = respond((req) => service.getPackage(req.params.id));
const updatePackage = respond(async (req) => ({
  message: "Package updated. The change applies to new purchases and new users only.",
  package: await service.updatePackage(req.admin, req.params.id, req.body),
}));
const listAuditLogs = respond((req) => service.listAuditLogs(req.params.id, req.validatedQuery));

module.exports = { listPackages, getPackage, updatePackage, listAuditLogs };
