"use strict";

const {
  getCart,
  addToCart,
  updateCartItemQty,
  deleteCartItem,
  clearCart
} = require("../controllers/cart");
const router = require("express").Router();
const {ensureLoggedIn, ensureAdmin, ensureUser} = require("../middleware/auth/auth");

router
  .route("/:username")
  .get(getCart)
  .delete(ensureLoggedIn, ensureAdmin, clearCart)
  
router
  .route("/:username/:productId")
  .post(ensureLoggedIn, ensureAdmin, addToCart)
  .put(ensureLoggedIn, ensureAdmin, updateCartItemQty)
  .delete(ensureLoggedIn, ensureAdmin, deleteCartItem)


module.exports = router;