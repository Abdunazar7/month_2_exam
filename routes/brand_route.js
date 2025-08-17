const express = require("express");
const { Brand, brandValidator, brandUpdateValidator } = require("../models/brand_model");

const route = express.Router();

route.post("/", async (req, res) => {
  try {
    const { error, value } = brandValidator.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const exists = await Brand.findOne({ name: value.name });
    if (exists) return res.status(409).json({ message: "Brand already exists!" });

    const brand = new Brand(value);
    await brand.save();

    res.status(201).send({ message: "Brand created successfully", brand });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

route.get("/", async (req, res) => {
  try {
    let { page = 1, take = 15 } = req.query;
    page = +page;
    take = +take;

    const brands = await Brand.find()
      .skip((page - 1) * take)
      .limit(take);

    res.status(200).send(brands);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

route.get("/:id", async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).send({ message: "Brand not found!" });

    res.status(200).send(brand);
  } catch (err) {
    if (err.name === "CastError")
      return res.status(400).send({ message: "Invalid ID format!" });
    res.status(400).send({ message: err.message });
  }
});

route.patch("/:id", async (req, res) => {
  try {
    const { error, value } = brandUpdateValidator.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const brand = await Brand.findByIdAndUpdate(req.params.id, value, {
      new: true,
    });

    if (!brand) return res.status(404).send({ message: "Brand not found!" });

    res.status(200).send({ message: "Brand updated successfully", brand });
  } catch (err) {
    if (err.name === "CastError")
      return res.status(400).send({ message: "Invalid ID format!" });
    res.status(400).send({ message: err.message });
  }
});

route.delete("/:id", async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) return res.status(404).send({ message: "Brand not found!" });

    res.status(204).send();
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

module.exports = route;
