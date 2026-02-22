const express = require("express");
const router = express.Router();

const authRoute = require("./authRoute");
// const userRoute = require("./userRoute");
// const productRoute = require("./productRoute");

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
// router.use("/users", userRoute);
// router.use("/products", productRoute);

module.exports = router;