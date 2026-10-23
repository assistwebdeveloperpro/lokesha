import Joi from "../joi";

// Mirrors the pricing rules in backend/src/modules/landing/property/property.validation.js
export const MAX_AMOUNT = 99999999999999;
export const MAX_NOTICE_PERIOD_MONTHS = 60;

const amountSchema = Joi.number().min(0).max(MAX_AMOUNT).required();

const noticePeriodSchema = Joi.number()
  .integer()
  .min(0)
  .max(MAX_NOTICE_PERIOD_MONTHS)
  .required();

export const isValidAmount = (value: number) => !amountSchema.validate(value).error;

export const isValidNoticePeriod = (value: number) =>
  !noticePeriodSchema.validate(value).error;
