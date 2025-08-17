const mongoose = require("mongoose");
const joi = require("joi");

const PlanSchema = new mongoose.Schema({
  months: {
    type: Number, // 5, 10, 15
    required: true,
  },
  percentage: {
    type: Number, // 26, 41, 52
    required: true,
  }
}, { timestamps: true });

// ✅ create validator
const planValidator = joi.object({
  months: joi.number().valid(5, 10, 15).required(),
  percentage: joi.number().min(0).required(),
});

// ✅ update validator
const planUpdateValidator = joi.object({
  months: joi.number().valid(5, 10, 15).optional(),
  percentage: joi.number().min(0).optional(),
}).min(1);

const Plan = mongoose.model("Plan", PlanSchema);

module.exports = { Plan, planValidator, planUpdateValidator };
