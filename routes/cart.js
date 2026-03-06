"use strict";

// controllers
const {
  getCart,
  addToCart,
  updateCartItemQty,
  deleteCartItem,
  clearCart
} = require("../controllers/cart");

const router = require("express").Router();

// Middleware
const {ensureLoggedIn, ensureAdmin, ensureUser} = require("../middleware/auth/auth");
const validateParamId = require("../middleware/validation/validateParamId");
const validateUsername = require("../middleware/validation/validateUsername");

// Register param validators
router.param("productId", validateParamId("productId"));
router.param("username", validateUsername("username"));

router
  .route("/:username")
  .get(ensureLoggedIn, ensureAdmin, getCart)
  .delete(ensureLoggedIn, ensureAdmin, clearCart)
  
router
  .route("/:username/:productId")
  .post(ensureLoggedIn, ensureAdmin, addToCart)
  .put(ensureLoggedIn, ensureAdmin, updateCartItemQty)
  .delete(ensureLoggedIn, ensureAdmin, deleteCartItem)


module.exports = router;