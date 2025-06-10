"use strict";

const {
  addToWishlist,
  deleteToWishlist,
  clearWishlist,
  getWishlist
} = require("../controllers/wishlist");
const router = require("express").Router();
const {ensureLoggedIn, ensureUser, ensureUserOrAdmin} = require("../middleware/auth/auth");

router
  .route("/:username")
  .get(ensureLoggedIn, ensureUser, getWishlist)
  .delete(ensureLoggedIn, ensureUser, ensureUserOrAdmin, clearWishlist)

router
  .route("/:username/:productId")
  .post(ensureLoggedIn, ensureUser, addToWishlist)
  .delete(ensureLoggedIn, ensureUser, ensureUserOrAdmin, deleteToWishlist)

module.exports = router;