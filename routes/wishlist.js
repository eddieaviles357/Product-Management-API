"use strict";

const {
  addToWishlist,
  deleteToWishlist,
  clearWishlist,
  getWishlist
} = require("../controllers/wishlist");
const router = require("express").Router();
const {ensureLoggedIn, ensureUser} = require("../middleware/auth/auth");

router
  .route("/:username")
  .get(ensureLoggedIn, ensureUser, getWishlist)
  .delete(clearWishlist)

router
  .route("/:username/:productId")
  .post(addToWishlist)
  .delete(deleteToWishlist)

module.exports = router;