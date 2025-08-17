const express = require("express");
const { Contract, contractValidator, contractUpdateValidator } = require("../models/contract_model");
const { Product } = require("../models/product_model");
const { Plan } = require("../models/plan_model");

const route = express.Router();

route.post("/", async (req, res) => {
  try {
    const { error, value } = contractValidator.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const product = await Product.findById(value.product_id);
    const plan = await Plan.findById(value.plan_id);

    if (!product || !plan) {
      return res.status(404).json({ message: "Product or Plan not found" });
    }

    const initialPayment = product.price * 0.25;
    const remaining = product.price - initialPayment;
    const totalDebt = remaining * (1 + plan.percentage / 100);
    const monthlyPayment = totalDebt / plan.months;
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + plan.months);

    const contract = new Contract({
      ...value,
      initialPayment,
      totalDebt,
      monthlyPayment,
      endDate,
    });

    await contract.save();
    res.status(201).send({ message: "Contract created successfully", contract });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

route.get("/", async (req, res) => {
  try {
    const contracts = await Contract.find()
      .populate("customer_id", "fullName phone")
      .populate("product_id", "name price")
      .populate("plan_id", "months percentage");

    res.status(200).send(contracts);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

route.get("/:id", async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate("customer_id", "fullName phone")
      .populate("product_id", "name price")
      .populate("plan_id", "months percentage");

    if (!contract) return res.status(404).send({ message: "Contract not found" });

    res.status(200).send(contract);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    res.status(400).send({ message: err.message });
  }
});

route.patch("/:id", async (req, res) => {
  try {
    const { error, value } = contractUpdateValidator.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const contract = await Contract.findByIdAndUpdate(req.params.id, value, { new: true });
    if (!contract) return res.status(404).send({ message: "Contract not found" });

    res.status(200).send({ message: "Contract updated successfully", contract });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

route.delete("/:id", async (req, res) => {
  try {
    const contract = await Contract.findByIdAndDelete(req.params.id);
    if (!contract) return res.status(404).send({ message: "Contract not found" });
    res.status(204).send();
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

module.exports = route;
