const mongoose = require("mongoose");
const joi = require("joi");

const ProductSchema = new mongoose.Schema(
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
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true }
);

const productValidator = joi.object({
  name: joi.string().required(),
  brand_id: joi.string().hex().length(24).required(),
  category_id: joi.string().hex().length(24).required(),
  price: joi.number().min(0).required(),
  description: joi.string().optional(),
  image: joi.string().optional(),
});

const productUpdateValidator = joi
  .object({
    name: joi.string().optional(),
    brand_id: joi.string().hex().length(24).optional(),
    category_id: joi.string().hex().length(24).optional(),
    price: joi.number().min(0).optional(),
    description: joi.string().optional(),
    image: joi.string().optional(),
  })
  .min(1);

const Product = mongoose.model("Product", ProductSchema);

module.exports = { Product, productValidator, productUpdateValidator };
