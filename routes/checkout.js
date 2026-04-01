"use strict";

/** Routes for Products. */

// controllers
const {
  createOrder,
  getOrdersById,
  getAllOrders
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
  .route('/createorder/:username')
  .post(ensureLoggedIn, ensureUser, createOrder)

router
  .route('/getorder/:username/:orderId')
  .get(ensureLoggedIn, ensureUserOrAdmin, getOrdersById);

router
  .route('/getallorders/:username')
  .get(ensureLoggedIn, ensureUserOrAdmin, getAllOrders);

module.exports = router;