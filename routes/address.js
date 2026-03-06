"use strict";

// controllers
const {
  getAddress,
  upsertAddress,
  deleteAddress
} = require("../controllers/address");

const router = require("express").Router();

// Middleware
const { ensureLoggedIn, ensureUser, ensureUserOrAdmin } = require("../middleware/auth/auth");
const validateUsername = require("../middleware/validation/validateUsername");

// Register param validators
router.param("username", validateUsername("username"));

router
  .route("/:username")
  .get(ensureLoggedIn, ensureUser, getAddress)
  .post(ensureLoggedIn, ensureUser, upsertAddress)
  .delete(ensureLoggedIn, ensureUser, ensureUserOrAdmin, deleteAddress);

module.exports = router;
