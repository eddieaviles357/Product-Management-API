"use strict";

const {
  getReviewsForProduct,
  getReview,
  addReviewToProduct
} = require("../controllers/reviews");
const router = require("express").Router();
const validateNewReview = require("../middleware/validateNewReview");

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
//   .delete()

module.exports = router;