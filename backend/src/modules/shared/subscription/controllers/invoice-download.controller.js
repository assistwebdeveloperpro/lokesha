const { renderInvoicePdf, buildInvoiceFileName } = require("../services/invoice-pdf.service");

// loadInvoice decides who may read which invoice, this only streams the saved snapshot as a PDF
const downloadInvoice = (loadInvoice) => async (req, res) => {
  try {
    const { invoiceNumber, snapshot } = await loadInvoice(req);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${buildInvoiceFileName(invoiceNumber)}"`);
    renderInvoicePdf(snapshot).pipe(res);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message, ...error.details });
    }

    console.error("Invoice download error:", error);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = { downloadInvoice };
