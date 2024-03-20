import Joi from "joi";
import { systemRoles } from "../../../src/utils/system-roles.js";

export const sginUpValid = {
  body: Joi.object({
    username: Joi.string().required().min(3).max(20).alphanum(),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    phoneNumbers: Joi.array().items(Joi.string().required().min(10).max(10)),
    addresses: Joi.array().items(Joi.string().required()),
    age: Joi.number().required().min(1),
  }),
};

export const signInValid = {
  body: Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
};

export const updatePasswordValid = {
  body: Joi.object({
    token: Joi.string().required(),
    newPassword : Joi.string().required(),
  }),
};

