"user strict";

const {
  registerUser,
  authenticateUser,
  verifyEmail,
} = require("../controllers/auth");
const router = require("express").Router();
const validateSchema = require("../middleware/validation/validateSchema");
const userAuthSchema = require("../schemas/userAuthSchema.json");
const newUserSchema = require("../schemas/newUserSchema.json");
const { authLimiter } = require("../middleware/limiter");

router
  .route("/register")
  .post(authLimiter, validateSchema(newUserSchema),registerUser)

router
  .route("/authenticate")
  .post(authLimiter, validateSchema(userAuthSchema), authenticateUser)

router
  .route("/verify-email")
  .post(authLimiter, verifyEmail)
module.exports = router;