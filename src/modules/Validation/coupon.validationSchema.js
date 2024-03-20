import Joi from "joi";
import { generalValidationRule } from "../../utils/general.validation.rule.js";

export const addCouponValid = {
  body: Joi.object({
    couponCode: Joi.string().required().min(3).max(20),
    couponAmount: Joi.number().required().min(1),
    couponStatus: Joi.string().required(),
    isFixed: Joi.boolean(),
    isPercentage: Joi.boolean(),
    fromDate: Joi.date()
      .greater(Date.now() - 24 * 60 * 60 * 1000)
      .required(),
    toDate: Joi.date().greater(Joi.ref("fromDate")).required(),
    Users: Joi.array().items(
      Joi.object({
        userId: generalValidationRule.dbId.required(),
        maxUsage: Joi.number().required().min(1),
      })
    ),
  }),
};

export const CouponValid = {
  body: Joi.object({
    couponCode: Joi.string().required().min(3).max(20),
  }),
};
