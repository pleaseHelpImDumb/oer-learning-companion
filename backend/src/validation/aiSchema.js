const Joi = require("joi");

const chatSchema = Joi.object({
  message: Joi.string().min(2).max(200).required(),
  supportLevel: Joi.number().integer().min(1).max(3).required(),
});

module.exports = {
  chatSchema,
};
