import Joi from "joi";
import { generalValidationRule } from "../../utils/general.validation.rule.js";

export const addOrderValid = {
    body: Joi.object({
       productId: generalValidationRule.dbId,
       quantity: Joi.number().min(1),
       paymentMethod: Joi.string().required(),
       address: Joi.string().required(),
       city: Joi.string().required(),
       postalCode: Joi.string().required(),
       country: Joi.string().required(),
       phoneNumbers: Joi.array().items(Joi.string().required().min(10).max(10)).required(),
       couponCode: Joi.string().min(3),
    })
  
};
