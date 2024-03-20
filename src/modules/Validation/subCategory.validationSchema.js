import Joi from "joi";

export const addSubCategoryValid = {
  body: Joi.object({
    name: Joi.string().required().min(3).max(20).alphanum(),
    image: Joi.string().required(),
  }),
};
