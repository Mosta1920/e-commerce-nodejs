import Joi from "joi";
import { generalValidationRule } from "../../utils/general.validation.rule.js";

export const addReviewValid = {
  body: Joi.object({
    reviewComment : Joi.string(),
    reviewRate: Joi.number(),
  }),
  query: Joi.object({
    productId: generalValidationRule.dbId,
    reviewId: generalValidationRule.dbId
  }),
};
