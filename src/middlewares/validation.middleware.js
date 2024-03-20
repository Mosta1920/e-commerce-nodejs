import Joi from "joi";

const reqKeys = ["query", "body", "params", "headers" , "file"];

export const generalFieldsValidation = {
  file: Joi.object({
    size: Joi.number().positive(),
    path: Joi.string(),
    filename: Joi.string(),
    mimetype: Joi.string(),
    originalname: Joi.string(),
    encoding: Joi.string(),
    fieldname: Joi.string(),
    buffer: Joi.any(),
  })
};



export const validationMiddleware = (schema) => {
  return (req, res, next) => {
    let validationErrorArr = [];
    for (const key of reqKeys) {
      const validationResult = schema[key]?.validate(req[key], {
        abortEarly: false,
      });
      if (validationResult?.error) {
        validationErrorArr.push(...validationResult.error.details);
      }
    }

    if (validationErrorArr.length) {
      return res.status(400).json({
        err_msg: "validation error",
        errors: validationErrorArr.map((ele) => ele.message),
      });
    }
    next();
  };
};
