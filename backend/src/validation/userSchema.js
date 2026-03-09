const Joi = require("joi");

const registerSchema = Joi.object({
  username: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  identity: Joi.string().required(),
  password: Joi.string().min(6),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

const onboardSchema = Joi.object({
  nickname: Joi.string().max(15).allow(""),
  favQuote: Joi.string().max(500).optional().allow(""),
  avatarUrl: Joi.string().optional().allow("").max(500),
  checkInIntervalMinutes: Joi.number().integer().min(2).max(15),
  trackId: Joi.number().integer().required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  onboardSchema,
};
