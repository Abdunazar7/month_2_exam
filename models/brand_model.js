const mongoose = require("mongoose");
const joi = require("joi");

const BrandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

const brandValidator = joi.object({
  name: joi.string().required(),
  description: joi.string().optional(),
});

const brandUpdateValidator = joi
  .object({
    name: joi.string().optional(),
    description: joi.string().optional(),
  })
  .min(1);

const Brand = mongoose.model("Brand", BrandSchema);

module.exports = { Brand, brandValidator, brandUpdateValidator };
