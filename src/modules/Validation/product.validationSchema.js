import Joi from "joi";
import { generalValidationRule } from "../../utils/general.validation.rule.js";

export const addProductValid = {
  body: Joi.object(
    {
    title: Joi.string().required().min(3).max(20).alphanum(),
    desc: Joi.string(),
    basePrice: Joi.number().required().min(1),
    discount: Joi.number().default(0),
    stock: Joi.number().required().min(1),
    Images: Joi.array().items(
      Joi.object({
        secure_url: Joi.string().required(),
        public_id: Joi.string()
          .required()
      })
    ),
    specs: Joi.array().items(
      Joi.object({
        name: Joi.string(),
      })
    ),

    User: Joi.array().items(
      Joi.object({
        userId: generalValidationRule.dbId.required(),
        maxUsage: Joi.number().required().min(1),
      })
    ),
    SubCategory: Joi.array().items(
      Joi.object({
        subCategoryId: generalValidationRule.dbId.required(),
        maxUsage: Joi.number().required().min(1),
      })
    ),
    Category: Joi.array().items(
      Joi.object({
        categoryId: generalValidationRule.dbId.required(),
        maxUsage: Joi.number().required().min(1),
      })
    ),
    Brand: Joi.array().items(
      Joi.object({
        brandId: generalValidationRule.dbId.required(),
        maxUsage: Joi.number().required().min(1),
      })
    ),
  }
  
  ),
};
