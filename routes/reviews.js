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

// getReview
// addReview,
// updateReview,
// removeReview
router
  .route("/product/:id")
  .get(getReviewsForProduct)
router
  .route("/product/:productId/user/:userId")
  .get(getReview)
  .post(validateNewReview, addReviewToProduct)
  .put(validateUpdatedReview, updateReviewToProduct)
  .delete(deleteReviewFromProduct)
//   .delete()

module.exports = router;