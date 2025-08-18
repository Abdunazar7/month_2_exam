const mongoose = require("mongoose");
const joi = require("joi");

const ContractSchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    plan_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    contractNumber: { type: String, unique: true, required: true },
    initialPayment: { type: Number, required: true },
    totalDebt: { type: Number, required: true },
    monthlyPayment: { type: Number, required: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ["ACTIVE", "CLOSED", "CANCELED"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

const contractValidator = joi.object({
  customer_id: joi.string().required(),
  product_id: joi.string().required(),
  plan_id: joi.string().required(),
  contractNumber: joi.string().required(),
  initialPayment: joi.number().required(),
  totalDebt: joi.number().required(),
  startDate: joi.date().optional(),
});

const contractUpdateValidator = joi
  .object({
    status: joi.string().valid("ACTIVE", "CLOSED", "CANCELED").optional(),
    endDate: joi.date().optional(),
  })
  .min(1);

const Contract = mongoose.model("Contract", ContractSchema);

module.exports = { Contract, contractValidator, contractUpdateValidator };
