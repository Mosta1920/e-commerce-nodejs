import Joi from "joi";
import { generalValidationRule } from "../../utils/general.validation.rule.js";

export const addCartValid = {
  body: Joi.object({
    productId: generalValidationRule.dbId.required(),
    quantity: Joi.number().required().min(1),
  }),
};
