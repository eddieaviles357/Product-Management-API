"use strict";

const {
  getReviewsForProduct,
  getReview,
  addReviewToProduct,
  updateReviewToProduct,
  deleteReviewFromProduct
} = require("../controllers/reviews");
const router = require("express").Router();

const validateSchema = require("../middleware/validation/validateSchema");
const newReviewSchema = require("../schemas/newReviewSchema.json");
const updateReviewSchema = require("../schemas/updateReviewSchema.json");

const {ensureLoggedIn, ensureUser, ensureUserOrAdmin, ensureAdmin} = require("../middleware/auth/auth");

router
  .route("/product/:id")
  .get(getReviewsForProduct)

router
  .route("/product/:productId/:username")
  .get(getReview)
  .post(ensureLoggedIn, ensureUser, validateSchema(newReviewSchema), addReviewToProduct)
  .put(ensureLoggedIn, ensureUser, validateSchema(updateReviewSchema), updateReviewToProduct)
  .delete(ensureLoggedIn, ensureUserOrAdmin, deleteReviewFromProduct)

module.exports = router;