'use strict';

const Reviews = require("../models/Reviews");
const { BadRequestError } = require("../AppError");

// @desc      Get single review
// @route     GET /api/v1/reviews/:reviewId
// @access    Private/Admin ?????????
exports.getReview = async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);
    const userId = Number(req.params.userId)

    if(isNaN(productId) || isNaN(userId)) throw new BadRequestError("Id must be a number");

    const review = await Reviews.getSingleReview(productId, userId);

    return res.status(200).json({
      success: true,
      review: review
    });

  } catch (err) {
    return next(err);
  }
};

// @desc      Get reviews from product
// @route     GET /api/v1/reviews/product/:id
// @access    Private/Admin ?????????
exports.getReviewsForProduct = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if(isNaN(id)) throw new BadRequestError("Id must be a number");

    const reviewList = await Reviews.getReviewsForOneProduct(id);

    return res.status(200).json({
      success: true,
      reviews: reviewList
    });

  } catch (err) {
    return next(err);
  }
};

// @desc      Add review to product
// @route     POST /api/v1/reviews/product/:id
// @access    Private/Admin ?????????
exports.addReviewToProduct = async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);
    const userId = Number(req.params.userId);
    const reviewBody = req.body;

    if(isNaN(productId) || isNaN(userId)) throw new BadRequestError("Id must be a number");

    const review = await Reviews.addReview(productId, userId, reviewBody);

    return res.status(200).json({
      success: true,
      review
    });

  } catch (err) {
    return next(err);
  }
};
