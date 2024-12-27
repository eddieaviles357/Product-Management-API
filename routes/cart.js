"use strict";

const {
  addToCart
} = require("../controllers/cart");
const router = require("express").Router();
const {ensureLoggedIn, ensureUser} = require("../middleware/auth/auth");

router
  .route("/:username/:productId")
  .post(addToCart)

module.exports = router;