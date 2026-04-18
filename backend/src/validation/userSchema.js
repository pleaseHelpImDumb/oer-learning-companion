const Joi = require("joi");
const password = Joi.string()
  .min(8)
  .pattern(/^(?=.*[0-9])(?=.*[^A-Za-z0-9]).*$/)
  .required()
  .messages({
    "string.min": "Password must be at least 8 characters",
    "string.pattern.base":
      "Password must include at least one number and one symbol",
    "any.required": "Password is required",
  });

const registerSchema = Joi.object({
  username: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: password,
});

const loginSchema = Joi.object({
  identity: Joi.string().required(),
  password: Joi.string(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: password,
});

const onboardSchema = Joi.object({
  nickname: Joi.string().max(15).allow(""),
  favoriteQuote: Joi.string().max(500).optional().allow(""),
  avatarUrl: Joi.string().optional().allow("").max(500),
  checkInIntervalMinutes: Joi.number().integer().min(2).max(15),
  trackId: Joi.number().integer().required(),
  yearLevel: Joi.number().integer().min(1).max(4).required(),
  major: Joi.string().max(20).allow("").required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  onboardSchema,
};
