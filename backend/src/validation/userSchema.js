const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  identity: Joi.string().required(),
  password: Joi.string().min(6),
});
module.exports = { registerSchema, loginSchema };
