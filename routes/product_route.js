const express = require("express");
const upload = require("./../config/upload");
const {
  Product,
  productValidator,
  productUpdateValidator,
} = require("../models/product_model");

const route = express.Router();

route.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).send({ message: "Image required" });
  res.status(200).send({ filename: req.file.filename });
});

route.post("/", async (req, res) => {
  try {
    const { error, value } = productValidator.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const product = new Product(value);
    await product.save();

    res.status(201).send({ message: "Product created successfully", product });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

route.get("/", async (req, res) => {
  try {
    let { page = 1, take = 15, brand_id, category_id, minPrice, maxPrice } = req.query;
    page = +page;
    take = +take;

    const filter = {};
    if (brand_id) filter.brand_id = brand_id;
    if (category_id) filter.category_id = category_id;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = +minPrice;
      if (maxPrice) filter.price.$lte = +maxPrice;
    }

    const products = await Product.find(filter)
      .populate("brand_id", "name")
      .populate("category_id", "name")
      .skip((page - 1) * take)
      .limit(take);

    res.status(200).send(products);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

route.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("brand_id", "name")
      .populate("category_id", "name");

    if (!product) return res.status(404).send({ message: "Product not found!" });

    res.status(200).send(product);
  } catch (err) {
    if (err.name === "CastError")
      return res.status(400).send({ message: "Invalid ID format!" });
    res.status(400).send({ message: err.message });
  }
});

route.patch("/:id", async (req, res) => {
  try {
    const { error, value } = productUpdateValidator.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const product = await Product.findByIdAndUpdate(req.params.id, value, {
      new: true,
    })
      .populate("brand_id", "name")
      .populate("category_id", "name");

    if (!product) return res.status(404).send({ message: "Product not found!" });

    res.status(200).send({ message: "Product updated successfully", product });
  } catch (err) {
    if (err.name === "CastError")
      return res.status(400).send({ message: "Invalid ID format!" });
    res.status(400).send({ message: err.message });
  }
});

route.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).send({ message: "Product not found!" });

    res.status(204).send();
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

module.exports = route;
