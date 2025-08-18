const express = require("express");
const {
  Category,
  categoryValidator,
  categoryUpdateValidator,
} = require("../models/category_model");

const route = express.Router();

route.post("/", async (req, res) => {
  try {
    const { error, value } = categoryValidator.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const category = new Category(value);
    await category.save();

    res
      .status(201)
      .send({ message: "Category created successfully", category });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

route.get("/", async (req, res) => {
  try {
    let { page = 1, take = 15 } = req.query;
    page = +page;
    take = +take;

    const categories = await Category.find()
      .populate("brand_id", "name")
      .skip((page - 1) * take)
      .limit(take);

    res.status(200).send(categories);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

route.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate(
      "brand_id",
      "name"
    );
    if (!category)
      return res.status(404).send({ message: "Category not found!" });

    res.status(200).send(category);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

route.patch("/:id", async (req, res) => {
  try {
    const { error, value } = categoryUpdateValidator.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const category = await Category.findByIdAndUpdate(req.params.id, value, {
      new: true,
    }).populate("brand_id", "name");

    if (!category)
      return res.status(404).send({ message: "Category not found!" });

    res
      .status(200)
      .send({ message: "Category updated successfully", category });
  } catch (err) {
    if (err.name === "CastError")
      return res.status(400).send({ message: "Invalid ID format!" });
    res.status(400).send({ message: err.message });
  }
});

route.delete("/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category)
      return res.status(404).send({ message: "Category not found!" });

    res.status(204).send();
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

module.exports = route;
