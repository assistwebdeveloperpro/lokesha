const service = require("./razorpay-webhook.service");

// Only a bad signature or body is the sender's fault; any other failure answers 500 so Razorpay retries
async function receiveWebhook(req, res) {
  try {
    await service.handleWebhook({
      rawBody: req.body,
      signature: req.get("x-razorpay-signature"),
      eventIdHeader: req.get("x-razorpay-event-id"),
    });
    return res.status(200).json({ received: true });
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ message: error.message });
    }

    console.error("Razorpay webhook error:", error);
    return res.status(500).json({ message: "Webhook could not be processed" });
  }
}

module.exports = { receiveWebhook };
