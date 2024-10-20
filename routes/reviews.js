"use strict";

const {
  getReviewsForProduct,
  getReview,
  addReviewToProduct,
  updateReviewToProduct,
} = require("../controllers/reviews");
const router = require("express").Router();
const validateNewReview = require("../middleware/validateNewReview");
const validateUpdatedReview = require("../middleware/validateUpdatedReview");

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
//   .delete()

module.exports = router;