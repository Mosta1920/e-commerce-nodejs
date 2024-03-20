import Joi from "joi";
import { generalValidationRule } from "../../utils/general.validation.rule.js";

export const addBrandValid = {
  body: Joi.object({
    name: Joi.string().required().min(3).max(20).alphanum(),
    image: Joi.string().required(),
   
  }),
  query: Joi.object({
    categoryId: generalValidationRule.dbId.required(),
    subCategoryId: generalValidationRule.dbId.required(),
  }),
};
