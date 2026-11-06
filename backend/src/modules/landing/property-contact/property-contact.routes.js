const express = require("express");
const validate = require("../../../middlewares/validate.middleware");
const authMiddleware = require("../../../middlewares/auth.middleware");
const controller = require("./property-contact.controller");
const { contactListerSchema } = require("./property-contact.validation");

const router = express.Router();

router.get("/contacted", authMiddleware, controller.listContacted);
router.post("/", authMiddleware, validate(contactListerSchema), controller.contactLister);

module.exports = router;
