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
const {ensureLoggedIn, ensureUserOrAdmin, ensureAdmin} = require("../middleware/auth/auth");

// getReview
// addReview,
// updateReview,
// removeReview
router
  .route("/product/:id")
  .get(getReviewsForProduct)
router
  .route("/product/:productId/:username/:userId")
  .get(getReview)
  .post(ensureLoggedIn, ensureUserOrAdmin, validateNewReview, addReviewToProduct)
  .put(ensureLoggedIn, ensureUserOrAdmin, validateUpdatedReview, updateReviewToProduct)
  .delete(ensureLoggedIn, ensureUserOrAdmin, deleteReviewFromProduct)
//   .delete()

module.exports = router;