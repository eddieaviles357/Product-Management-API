"user strict";

// controllers
const {
  registerUser,
} = require("../controllers/auth");

const router = require("express").Router();

// Middleware
const validateSchema = require("../middleware/validation/validateSchema");

// Schemas
const newUserSchema = require("../schemas/newUserSchema.json");
const { authLimiter } = require("../middleware/limiter");

router
  .route("/register")
  .post(authLimiter, validateSchema(newUserSchema),registerUser)

module.exports = router;