import Joi from "joi";

export const addCategoryValid = {
  body: Joi.object({
    name: Joi.string().required().min(3).max(20).alphanum(),
    image: Joi.string().required(), 
  }),
};
