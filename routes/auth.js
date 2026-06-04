"user strict";

// controllers
const {
  authenticateUser,
  verifyEmail,
  resendVerificationEmail
} = require("../controllers/auth");

const router = require("express").Router();

// Middleware
const validateSchema = require("../middleware/validation/validateSchema");

// Schemas
const userAuthSchema = require("../schemas/userAuthSchema.json");
const newUserSchema = require("../schemas/newUserSchema.json");
const { authLimiter } = require("../middleware/limiter");

router
  .route("/authenticate")
  .post(authLimiter, validateSchema(userAuthSchema), authenticateUser)

router
  .route("/verify-email")
  .post(authLimiter, verifyEmail)

router
  .route("/resend-verification")
  .post(authLimiter, resendVerificationEmail)
module.exports = router;