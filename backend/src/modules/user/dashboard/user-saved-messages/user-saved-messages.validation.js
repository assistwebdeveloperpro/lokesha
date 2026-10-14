const Joi = require("joi");

const SAVED_MESSAGE_CATEGORIES = ["property", "requirements", "agents", "builders"];

const saveMessageSchema = Joi.object({
  category: Joi.string()
    .valid(...SAVED_MESSAGE_CATEGORIES)
    .required(),
  message: Joi.string().max(1000).allow("").required(),
});

module.exports = { saveMessageSchema, SAVED_MESSAGE_CATEGORIES };
