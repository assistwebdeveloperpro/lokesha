const service = require("./user-subscription.service");
const overview = require("./user-subscription-overview.service");
const invoiceService = require("../../../shared/subscription/services/invoice.service");
const { downloadInvoice: invoiceDownload } = require("../../../shared/subscription/controllers/invoice-download.controller");

function handleError(res, error) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message, ...error.details });
  }

  console.error("User subscription error:", error);
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
const getQuote = respond((req) => service.getQuote(req.body));
const createOrder = respond((req) => service.createOrder(req.user.id, req.body), 201);
const verifyPayment = respond((req) => service.verifyPayment(req.user.id, req.params.id, req.body));
const getOverview = respond((req) => overview.getOverview(req.user.id));
const getCredits = respond((req) => overview.getCredits(req.user.id));
const listHistory = respond((req) => overview.listHistory(req.user.id, req.validatedQuery));
const listPayments = respond((req) => overview.listPayments(req.user.id, req.validatedQuery));
const listLedger = respond((req) => overview.listLedger(req.user.id, req.validatedQuery));
const listPropertyUsage = respond((req) => overview.listPropertyUsage(req.user.id, req.validatedQuery));
const downloadInvoice = invoiceDownload((req) => invoiceService.getInvoiceForUser(req.user.id, req.params.id));

module.exports = {
  listPackages,
  getQuote,
  createOrder,
  verifyPayment,
  getOverview,
  getCredits,
  listHistory,
  listPayments,
  listLedger,
  listPropertyUsage,
  downloadInvoice,
};
