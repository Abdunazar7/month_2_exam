const express = require("express");
const { Contract } = require("../models/contract_model");
const { Payment } = require("../models/payment_model");

const route = express.Router();

route.get("/sold-products", async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res
        .status(400)
        .send({ message: "start and end query params are required!" });
    }

    const contracts = await Contract.find({
      startDate: { $gte: new Date(start), $lte: new Date(end) }
    })
      .populate("customer_id", "fullName phone")
      .populate("product_id", "name price")
      .populate("plan_id", "months percentage");

    res.status(200).send(contracts);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

route.get("/overdue-contracts", async (req, res) => {
  try {
    const today = new Date();

    const contracts = await Contract.find({ status: "ACTIVE" })
      .populate("customer_id", "fullName")
      .populate("product_id", "name price")
      .populate("plan_id", "months");

    let overdueList = [];

    for (let c of contracts) {
      let monthsPassed =
        (today.getFullYear() - c.startDate.getFullYear()) * 12 +
        (today.getMonth() - c.startDate.getMonth()) + 1;

        console.log("Contract:", c.contractNumber, "Months passed:", monthsPassed);
      if (monthsPassed <= 0) continue;

      let requiredPayment = c.monthlyPayment * monthsPassed;
      console.log(c.monthlyPayment);
      
      console.log("Required:", requiredPayment);
      const payments = await Payment.find({ contract_id: c._id });
      const paid = payments.reduce((sum, p) => sum + p.amount, 0);
      console.log("Paid:", paid);
      if (paid < requiredPayment) {
        overdueList.push({
          customer: c.customer_id.fullName,
          product: c.product_id.name,
          contractNumber: c.contractNumber,
          shouldPay: requiredPayment - paid,
          monthsPassed,
          overdueDays: Math.floor(
            (today - c.startDate) / (1000 * 60 * 60 * 24)
          )
        });
      }
    }

    res.status(200).send(overdueList);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

module.exports = route;
