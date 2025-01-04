"use strict";

const {
  addToCart,
  updateCartItemQty,
  deleteCartItem
} = require("../controllers/cart");
const router = require("express").Router();
const {ensureLoggedIn, ensureUser} = require("../middleware/auth/auth");

router
  .route("/:username/:productId")
  .post(addToCart)
  .put(updateCartItemQty)
  .delete(deleteCartItem)

module.exports = router;