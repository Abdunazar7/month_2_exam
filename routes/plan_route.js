const express = require("express");
const {
  Plan,
  planValidator,
  planUpdateValidator,
} = require("../models/plan_model");

const route = express.Router();

route.post("/", async (req, res) => {
  try {
    const { error, value } = planValidator.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const exists = await Plan.findOne({ months: value.months });
    if (exists) {
      return res
        .status(409)
        .send({ message: "Plan for this month already exists!" });
    }

    const plan = new Plan(value);
    await plan.save();

    res.status(201).send({ message: "New plan created", plan });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

route.get("/", async (req, res) => {
  try {
    const plans = await Plan.find();
    res.status(200).send(plans);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

route.get("/:id", async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).send({ message: "Plan not found" });
    res.status(200).send(plan);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

route.patch("/:id", async (req, res) => {
  try {
    const { error, value } = planUpdateValidator.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const plan = await Plan.findByIdAndUpdate(req.params.id, value, {
      new: true,
    });
    if (!plan) return res.status(404).send({ message: "Plan not found" });

    res.status(200).send({ message: "Plan updated", plan });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

route.delete("/:id", async (req, res) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).send({ message: "Plan not found" });
    res.status(204).send();
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

module.exports = route;
