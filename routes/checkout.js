"use strict";

/** Routes for Products. */

// controllers
const {
  createOrder,
  getOrdersById
} = require("../controllers/checkout");
// const router = require("express").Router({mergeParams: true});
const router = require("express").Router({mergeParams: true});

// Middleware
const { ensureLoggedIn, ensureUser, ensureUserOrAdmin } = require("../middleware/auth/auth");
const validateParamId = require("../middleware/validation/validateParamId");
const validateUsername = require("../middleware/validation/validateUsername");

// Register param validators
router.param("orderId", validateParamId("orderId"));
router.param("username", validateUsername("username"));

router
  .route('/:username')
  .post(ensureLoggedIn, ensureUser, createOrder)

router
  .route('/:username/:orderId')
  .get(ensureLoggedIn, ensureUserOrAdmin, getOrdersById);

module.exports = router;

