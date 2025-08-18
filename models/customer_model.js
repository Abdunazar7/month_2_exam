const mongoose = require("mongoose");
const joi = require("joi");

const CustomerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    passportId: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    otp: String,
    otp_expires: Date,
  },
  { timestamps: true }
);

const customerValidator = joi.object({
  fullName: joi.string().required(),
  phone: joi.string().required(),
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
  passportId: joi.string().required(),
  address: joi.string().required(),
});

const customerUpdateValidator = joi
  .object({
    fullName: joi.string().optional(),
    phone: joi.string().optional(),
    email: joi.string().email().optional(),
    password: joi.string().min(6).optional(),
    passportId: joi.string().optional(),
    address: joi.string().optional(),
  })
  .min(1);

const Customer = mongoose.model("Customer", CustomerSchema);

module.exports = { Customer, customerValidator, customerUpdateValidator };
