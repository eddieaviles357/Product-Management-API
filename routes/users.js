"user strict";

// controllers
const {
  registerUser,
  removeUser
} = require("../controllers/auth");

const router = require("express").Router();

// Middleware
const {ensureLoggedIn, ensureUserOrAdmin, ensureAdmin, ensureUser} = require("../middleware/auth/auth");
const validateSchema = require("../middleware/validation/validateSchema");
const validateUsername = require("../middleware/validation/validateUsername");

// Schemas
const newUserSchema = require("../schemas/newUserSchema.json");
const { authLimiter } = require("../middleware/limiter");

// Register param validators
router.param("username", validateUsername("username"));

router
  .route("/register")
  .post(authLimiter, validateSchema(newUserSchema), registerUser)

router
  .route("/:username")
  .delete(authLimiter, ensureLoggedIn, ensureUserOrAdmin, removeUser);

module.exports = router;