const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const rootRouter = require("./routes/rootRouter");
const errorHandler = require("./middlewares/errorHandler");
// const { swaggerUi, swaggerSpec } = require("./utils/swagger");

const app = express();

/* ======================
   Global Middlewares
====================== */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

/* ======================
   Swagger Docs
====================== */
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* ======================
   Routes
====================== */
app.use("/api", rootRouter);

/* ======================
   Health Check
====================== */
app.get("/", (req, res) => {
  res.json({ message: "API is running 🚀" });
});

/* ======================
   404 Handler
====================== */
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

/* ======================
   Error Handler
====================== */
app.use(errorHandler);

module.exports = app;