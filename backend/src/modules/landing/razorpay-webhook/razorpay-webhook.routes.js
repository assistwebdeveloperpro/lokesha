const express = require("express");
const controller = require("./razorpay-webhook.controller");

const MAX_BODY_SIZE = "1mb";

const router = express.Router();

router.post("/", express.raw({ type: "application/json", limit: MAX_BODY_SIZE }), controller.receiveWebhook);

module.exports = router;
