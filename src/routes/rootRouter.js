const express = require("express");
const router = express.Router();

const authRoute = require("./authRoute");
const categoryRoute = require("./categoryRoute");
const productRoute = require("./productRoute");
const pcBuildRoute = require("./pcBuildRoute");
const specificationRoute = require("./specificationRoute");
const uploadRoute = require("./uploadRoute");
const cartRoute = require("./cartRoute");
const promotionRoute = require("./promotionRoute");
const orderRoute = require("./orderRoute");
const checkoutRoute = require("./checkoutRoute");
const paymentRoute = require("./paymentRoute");
const userBuildRoute = require("./userBuildRoute");
const userRoute = require("./userRoute");
const staffBuildRequestRoute = require("./staffBuildRequestRoute");

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
router.use("/pc-builds", pcBuildRoute);
router.use("/specifications", specificationRoute);
router.use("/upload", uploadRoute);
router.use("/cart", cartRoute);
router.use("/promotions", promotionRoute);
router.use("/orders", orderRoute);
router.use("/checkout", checkoutRoute);
router.use("/payments", paymentRoute);
router.use("/user-builds", userBuildRoute);
router.use("/users", userRoute);
router.use("/staff-build-requests", staffBuildRequestRoute);

module.exports = router;