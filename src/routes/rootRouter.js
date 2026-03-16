const express = require("express");
const router = express.Router();

const authRoute = require("./authRoute");
const categoryRoute = require("./categoryRoute");
const productRoute = require("./productRoute");
const pcBuildRoute = require("./pcBuildRoute");
const specificationRoute = require("./specificationRoute");
const specificationRouteV2 = require("./specificationRouteV2");
const compatibilityRoute = require("./compatibilityRoute");
const uploadRoute = require("./uploadRoute");
const cartRoute = require("./cartRoute");
const aiRoute = require("./aiRoute");
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
router.use("/pc-builds", pcBuildRoute);
router.use("/specifications", specificationRoute);
router.use("/specifications-v2", specificationRouteV2);
router.use("/compatibility", compatibilityRoute);
router.use("/upload", uploadRoute);
router.use("/cart", cartRoute);
router.use("/ai", aiRoute);
// router.use("/users", userRoute);

module.exports = router;