const Joi = require("joi");

const sessionSchema = Joi.object({
  sessionGoalMinutes: Joi.number().integer().min(10).max(120).required(),
});

module.exports = {
  sessionSchema,
};
