require("dotenv").config();

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const PORT = process.env.PORT || 5000;

const SERVER_URL =
  process.env.NODE_ENV === "production"
    ? process.env.SERVER_URL
    : `http://localhost:${PORT}`;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SWD392 - PCS PC Component Store API",
      version: "1.0.0",
      description: "API documentation for PC Component Store Backend",
    },
    servers: [
      {
        url: SERVER_URL,
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },

  // Swagger sẽ đọc comment từ các file này
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec,
};