"use strict";

const {
  getReviewsForProduct,
  getReview,
  addReviewToProduct
} = require("../controllers/reviews");
const router = require("express").Router();

// getReview
// addReview,
// updateReview,
// removeReview
router
  .route("/:reviewId")
  .get(getReview)
router
  .route("/product/:id")
  .get(getReviewsForProduct)
router
  .route("/product/:productId/user/:userId")
  .post(addReviewToProduct)
//   .delete()

module.exports = router;