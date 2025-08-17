const express = require("express");
const connectdb = require("./config/connectdb");
require("dotenv").config();
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

connectdb;
app.use("/files", express.static(__dirname + "/uploads"));

const customerRoute = require("./routes/customer_route");
const productRoute = require("./routes/product_route");
const brandRoute = require("./routes/brand_route");
const categoryRoute = require("./routes/category_route");
const planRoute = require("./routes/plan_route");
const contractRoute = require("./routes/contract_route");
const paymentRoute = require("./routes/payment_route");

app.use("/customers", customerRoute);
app.use("/products", productRoute);
app.use("/brands", brandRoute);
app.use("/categories", categoryRoute);
app.use("/plans", planRoute);
app.use("/contracts", contractRoute);
app.use("/payments", paymentRoute);

const PORT = +process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});