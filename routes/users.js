"user strict";

// controllers
const {
  registerUser,
  removeUser
} = require("../controllers/users");

const router = require("express").Router();

// Middleware
const {ensureLoggedIn, ensureUserOrAdmin, ensureAdmin, ensureUser} = require("../middleware/auth/auth");
const validateSchema = require("../middleware/validation/validateSchema");
const validateUsername = require("../middleware/validation/validateUsername");

// Schemas
const newUserSchema = require("../schemas/newUserSchema.json");
const { authLimiter } = require("../middleware/limiter");

router
  .route("/register")
  .post(authLimiter, validateSchema(newUserSchema), registerUser)

router
  .route("/me")
  .delete(authLimiter, ensureLoggedIn, removeUser);

module.exports = router;