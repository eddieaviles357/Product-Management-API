"use strict";

/** Routes for Products. */

const {
  createOrder,
  getOrdersById
} = require("../controllers/checkout");
// const router = require("express").Router({mergeParams: true});
const router = require("express").Router({mergeParams: true});
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth/auth");

router
  .route('/:username')
  .post(createOrder)

router
  .route('/:username/:orderId')
  .get(getOrdersById);

module.exports = router;

