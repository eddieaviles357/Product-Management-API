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
  .get(ensureUser,ensureLoggedIn, getCart)
  .delete(ensureUser, ensureLoggedIn, clearCart)
  
router
  .route("/:username/:productId")
  .post(ensureUser, ensureLoggedIn, addToCart)
  .put(ensureUser, ensureLoggedIn, updateCartItemQty)
  .delete(ensureUser, ensureLoggedIn, deleteCartItem)


module.exports = router;