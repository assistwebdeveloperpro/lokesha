const service = require("./subscription-transactions.service");

function handleError(res, error) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message, ...error.details });
  }

  console.error("Subscription transactions error:", error);
  return res.status(500).json({ message: "Something went wrong. Please try again." });
}

const respond = (action) => async (req, res) => {
  try {
    return res.status(200).json(await action(req));
  } catch (error) {
    return handleError(res, error);
  }
};

const listTransactions = respond((req) => service.listTransactions(req.validatedQuery));

async function exportTransactions(req, res) {
  try {
    const { fileName, csv } = await service.exportTransactions(req.validatedQuery);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    return res.status(200).send(csv);
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = { listTransactions, exportTransactions };
