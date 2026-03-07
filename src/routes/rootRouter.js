const express = require("express");
const router = express.Router();

const authRoute = require("./authRoute");
const categoryRoute = require("./categoryRoute");
const productRoute = require("./productRoute");
const specificationRoute = require("./specificationRoute");
const uploadRoute = require("./uploadRoute");
const cartRoute = require("./cartRoute");
const supplierRoute = require("./supplierRoute");
// const userRoute = require("./userRoute");

/* ======================
   Test Route
====================== */
router.get("/test", (req, res) => {
  res.json({
    message: "Root router working 🚀"
  });
});

/* ======================
Child Routes
====================== */
router.use("/auth", authRoute);
router.use("/categories", categoryRoute);
router.use("/products", productRoute);
router.use("/specifications", specificationRoute);
router.use("/upload", uploadRoute);
router.use("/cart", cartRoute);
router.use("/suppliers", supplierRoute);
// router.use("/users", userRoute);

module.exports = router;