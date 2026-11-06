const Joi = require("joi");

const CONTACT_ROLES = ["owner", "agent", "builder"];

const contactListerSchema = Joi.object({
  propertyId: Joi.string().uuid().required(),
  contactRole: Joi.string().valid(...CONTACT_ROLES).required(),
});

module.exports = { contactListerSchema, CONTACT_ROLES };
