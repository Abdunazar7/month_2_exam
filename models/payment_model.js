const mongoose = require("mongoose");
const joi = require("joi");

const PaymentSchema = new mongoose.Schema({
  contract_id: { type: mongoose.Schema.Types.ObjectId, ref: "Contract", required: true },
  amount: { type: Number, required: true },
  method: {type: String, enum: ["CARD", "CASH"], default: "CASH"},
  paymentDate: { type: Date, default: Date.now },
  status: { type: String, enum: ["PAID", "PENDING"], default: "PAID" }
}, { timestamps: true });

const paymentValidator = joi.object({
  contract_id: joi.string().required(),
  amount: joi.number().min(1).required(),
  paymentDate: joi.date().optional(),
  method: joi.string().valid("CARD", "CASH").optional(),
  status: joi.string().valid("PAID", "PENDING").optional(),
});

const paymentUpdateValidator = joi.object({
  amount: joi.number().min(1).optional(),
  paymentDate: joi.date().optional(),
  status: joi.string().valid("PAID", "PENDING").optional(),
}).min(1);

const Payment = mongoose.model("Payment", PaymentSchema);

module.exports = { Payment, paymentValidator, paymentUpdateValidator };
