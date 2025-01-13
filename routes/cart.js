"use strict";

const {
  getCart,
  addToCart,
  updateCartItemQty,
  deleteCartItem,
  clearCart
} = require("../controllers/cart");
const router = require("express").Router();
const {ensureLoggedIn, ensureUser} = require("../middleware/auth/auth");

router
  .route("/:username")
  .get(getCart)
  .delete(clearCart)
  
router
  .route("/:username/:productId")
  .post(addToCart)
  .put(updateCartItemQty)
  .delete(deleteCartItem)


module.exports = router;