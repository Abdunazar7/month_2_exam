const express = require("express");
const {
  Customer,
  customerValidator,
  customerUpdateValidator,
} = require("../models/customer_model");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { totp } = require("otplib");
const jwt = require("jsonwebtoken");
const upload = require("./../config/upload");

const route = express.Router();

totp.options = { step: 120, digits: 6 };

const emailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

route.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).send({ message: "Email is required." });
    }
    const otpSecret =
      email + (process.env.OTP_SECRET_KEY || "default_secret_key");
    const otp = totp.generate(otpSecret);

    await emailTransporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Account Verification Code",
      text: `Your verification code is: ${otp}`,
    });
    res.status(200).send({ message: `An OTP has been sent to ${email}.` });
  } catch (err) {
    res.status(400).send({ message: "An error occurred: " + err.message });
  }
});

route.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).send({ message: "Email and OTP are required." });
    }
    const otpSecret =
      email + (process.env.OTP_SECRET_KEY || "default_secret_key");
    const isValid = totp.check(otp, otpSecret);

    res.status(200).send({ isValid });
  } catch (err) {
    res.status(400).send({ message: "An error occurred: " + err.message });
  }
});

route.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: "Image is required." });
  }
  res.status(200).send({
    message: "Image uploaded successfully.",
    filename: req.file.filename,
  });
});

route.post("/register", async (req, res) => {
  try {
    const { error, value } = customerValidator.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const phoneExists = await Customer.findOne({ phone: value.phone });
    if (phoneExists) {
      return res
        .status(409)
        .send({ error: "Customer with this phone number already exists!" });
    }

    const emailExists = await Customer.findOne({ email: value.email });
    if (emailExists) {
      return res
        .status(409)
        .send({ error: "Customer with this email already exists!" });
    }

    const hash = bcrypt.hashSync(value.password, 10);
    const customer = new Customer({ ...value, password: hash });

    await customer.save();

    res.status(201).send({ message: "Registered successfully!", customer });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

route.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .send({ error: "Email and password are required!" });
    }

    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(401).send({ error: "Invalid credentials!" });
    }

    const compare = bcrypt.compareSync(password, customer.password);
    if (!compare) {
      return res.status(401).send({ error: "Invalid credentials!" });
    }

    const token = jwt.sign(
      { id: customer._id, email: customer.email },
      process.env.JWT_SECRET_KEY || "default_secret_key",
      {
        expiresIn: "1h",
      }
    );

    res.status(200).send({ message: "Welcome!", token, customer });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

route.get("/", async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).send(customers);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

route.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).send({ message: "Customer not found!" });
    }
    res.status(200).send(customer);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).send({ message: "Invalid ID format!" });
    }
    res.status(400).send({ message: err.message });
  }
});

route.patch("/:id", async (req, res) => {
  try {
    const { error, value } = customerUpdateValidator.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    if (value.password) {
      value.password = await bcrypt.hash(value.password, 10);
    }

    const customer = await Customer.findByIdAndUpdate(req.params.id, value, {
      new: true,
    });

    if (!customer) {
      return res.status(404).send({ message: "Customer not found!" });
    }

    res
      .status(200)
      .send({ message: "Customer updated successfully.", customer });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

route.delete("/:id", async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).send({ message: "Customer not found!" });
    }
    res.status(204).send();
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

module.exports = route;
