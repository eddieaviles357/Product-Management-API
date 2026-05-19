"user strict";

// controllers
const {
  registerUser,
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
const {ensureLoggedIn, ensureUser, ensureUserOrAdmin} = require("../middleware/auth/auth");

router
  .route("/register")
  .post(authLimiter, validateSchema(newUserSchema),registerUser)

router
  .route("/authenticate")
  .post(authLimiter, validateSchema(userAuthSchema), authenticateUser)

router
  .route("/verify-email")
  .post(authLimiter, verifyEmail)

router
  .route("/resend-verification")
  .post(authLimiter, ensureLoggedIn, ensureUser, ensureUserOrAdmin, resendVerificationEmail)
module.exports = router;