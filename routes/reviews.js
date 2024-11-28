"use strict";

const {
  getReviewsForProduct,
  getReview,
  addReviewToProduct,
  updateReviewToProduct,
  deleteReviewFromProduct
} = require("../controllers/reviews");
const router = require("express").Router();
const validateNewReview = require("../middleware/validation/validateNewReview");
const validateUpdatedReview = require("../middleware/validation/validateUpdatedReview");
const {ensureLoggedIn, ensureUser, ensureUserOrAdmin, ensureAdmin} = require("../middleware/auth/auth");

router
  .route("/product/:id")
  .get(getReviewsForProduct)

router
  .route("/product/:productId/:username")
  .get(getReview)
  .post(ensureLoggedIn, ensureUser, validateNewReview, addReviewToProduct)
  .put(ensureLoggedIn, ensureUser, validateUpdatedReview, updateReviewToProduct)
  .delete(ensureLoggedIn, ensureUserOrAdmin, deleteReviewFromProduct)

module.exports = router;