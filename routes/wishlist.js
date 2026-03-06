"use strict";

// controllers
const {
  addToWishlist,
  deleteToWishlist,
  clearWishlist,
  getWishlist
} = require("../controllers/wishlist");

const router = require("express").Router();

// middleware
const validateParamId = require("../middleware/validation/validateParamId");
const validateUsername = require("../middleware/validation/validateUsername");
const {ensureLoggedIn, ensureUser, ensureUserOrAdmin} = require("../middleware/auth/auth");

// Register param validators
router.param("productId", validateParamId("productId"));
router.param("username", validateUsername("username"));

router
  .route("/:username")
  .get(ensureLoggedIn, ensureUser, getWishlist)
  .delete(ensureLoggedIn, ensureUser, ensureUserOrAdmin, clearWishlist)

router
  .route("/:username/:productId")
  .post(ensureLoggedIn, ensureUser, addToWishlist)
  .delete(ensureLoggedIn, ensureUser, ensureUserOrAdmin, deleteToWishlist)

module.exports = router;