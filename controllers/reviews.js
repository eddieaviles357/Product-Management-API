'use strict';

const Reviews = require("../models/Reviews");
const { BadRequestError } = require("../AppError");

// @desc      Get paginated reviews from product
// @route     GET /api/v1/reviews/product/:id
// @access    Private/Admin ?????????
exports.getReviewsForProduct = async (req, res, next) => {
  try {
    // Call updated model function
    const { 
      data,
      averageRating,
      pagination 
    } = await Reviews.getReviewsForOneProduct(req.params.id, req.pagination.page, req.pagination.limit);

    return res.status(200).json({
      success: true,
      averageRating,
      pagination,
      data,
    });

  } catch (err) {
    return next(err);
  }
};

// @desc      Get single review
// @route     GET /api/v1/reviews/product/:productId/:username
// @access    Private/Admin ?????????
exports.getReview = async (req, res, next) => {
  try {
    const review = await Reviews.getSingleReview(req.params.productId, req.params.username);

    return res.status(200).json({
      success: true,
      review: review
    });

  } catch (err) {
    return next(err);
  }
};

// @desc      Add review to product
// @route     POST /api/v1/reviews/product/:productId/:username
// @access    Private/Admin ?????????
exports.addReviewToProduct = async (req, res, next) => {
  try {
    const {review, rating} = req.body;

    const rev = await Reviews.addReview(req.params.productId, req.params.username, review, rating);

    return res.status(201).json({
      success: true,
      review: rev
    });

  } catch (err) {
    return next(err);
  }
};

// @desc      Updates review to product
// @route     PUT /api/v1/reviews/product/:productId/:username
// @access    Private/Admin ?????????
exports.updateReviewToProduct = async (req, res, next) => {
  try {
    const {review, rating} = req.body;

    const updatedReview = await Reviews.updateReview(req.params.productId, req.params.username, review, rating);

    return res.status(200).json({
      success: true,
      review: updatedReview
    });

  } catch (err) {
    return next(err);
  }
};

// // @desc      Deletes a review
// // @route     DELETE /api/v1/reviews/product/:productId/:username
// // @access    Private/Admin ?????????
exports.deleteReviewFromProduct = async (req, res, next) => {
  try {
    const {success, review} = await Reviews.deleteReview(req.params.productId, req.params.username);

    const statusCode = success ? 200 : 204;

    return res.status(statusCode).json({ 
      success,
      result: review
    });
  } catch (err) {
    return next(err);
  }
}