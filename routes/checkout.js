"use strict";

/** Routes for Products. */

const {
  createOrder,
  getOrdersById
} = require("../controllers/checkout");
// const router = require("express").Router({mergeParams: true});
const router = require("express").Router({mergeParams: true});
const { ensureLoggedIn, ensureUser, ensureUserOrAdmin } = require("../middleware/auth/auth");

router
  .route('/:username')
  .post(ensureLoggedIn, ensureUser, createOrder)

router
  .route('/:username/:orderId')
  .get(ensureLoggedIn, ensureUserOrAdmin, getOrdersById);

module.exports = router;

