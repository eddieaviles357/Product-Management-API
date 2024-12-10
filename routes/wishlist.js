"use strict";

const {
  addToWishlist,
  deleteToWishlist
} = require("../controllers/wishlist");
const router = require("express").Router();
const {ensureLoggedIn, ensureUser} = require("../middleware/auth/auth");

router
  .route("/:username/:productId")
  .post(addToWishlist)
  .delete(deleteToWishlist)

module.exports = router;