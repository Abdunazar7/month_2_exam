const mongoose = require("mongoose");
const joi = require("joi");

const PlanSchema = new mongoose.Schema(
  {
    months: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const planValidator = joi.object({
  months: joi.number().valid(5, 10, 15).required(),
  percentage: joi.number().min(0).required(),
});

const planUpdateValidator = joi
  .object({
    months: joi.number().valid(5, 10, 15).optional(),
    percentage: joi.number().min(0).optional(),
  })
  .min(1);

const Plan = mongoose.model("Plan", PlanSchema);

module.exports = { Plan, planValidator, planUpdateValidator };
