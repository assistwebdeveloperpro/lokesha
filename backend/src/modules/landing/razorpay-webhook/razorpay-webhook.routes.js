const express = require("express");
const controller = require("./razorpay-webhook.controller");

const MAX_BODY_SIZE = "1mb";

const router = express.Router();

// The signature covers the exact bytes, so the body must stay raw and never pass through express.json()
router.post("/", express.raw({ type: "application/json", limit: MAX_BODY_SIZE }), controller.receiveWebhook);

module.exports = router;
