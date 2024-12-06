"use strict";

const {
  addToWishlist
} = require("../controllers/wishlist");
const router = require("express").Router();
const {ensureLoggedIn, ensureUser} = require("../middleware/auth/auth");

router
  .route("/:username/addToWishlist/:productId")
  .post(addToWishlist)

module.exports = router;