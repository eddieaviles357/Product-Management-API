"use strict";

/** Routes for Products. */

// controllers
const {
  createOrder,
  getOrdersById,
  getAllOrders
} = require("../controllers/orders");
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
  .route('/:username/createorder')
  .post(ensureLoggedIn, ensureUser, createOrder)

router
  .route('/:username/getorder/:orderId')
  .get(ensureLoggedIn, ensureUserOrAdmin, getOrdersById);

router
  .route('/:username')
  .get(ensureLoggedIn, ensureUserOrAdmin, getAllOrders);

module.exports = router;