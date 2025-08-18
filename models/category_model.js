const mongoose = require("mongoose");
const joi = require("joi");

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    brand_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

const categoryValidator = joi.object({
  name: joi.string().required(),
  brand_id: joi.string().hex().length(24).required(),
  description: joi.string().optional(),
});

const categoryUpdateValidator = joi
  .object({
    name: joi.string().optional(),
    brand_id: joi.string().hex().length(24).optional(),
    description: joi.string().optional(),
  })
  .min(1);

const Category = mongoose.model("Category", CategorySchema);

module.exports = { Category, categoryValidator, categoryUpdateValidator };
