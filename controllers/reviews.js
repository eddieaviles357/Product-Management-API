'use strict';

const Reviews = require("../models/Reviews");
const { BadRequestError } = require("../AppError");

// @desc      Get paginated reviews from product
// @route     GET /api/v1/reviews/product/:id
// @access    Private/Admin ?????????
exports.getReviewsForProduct = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) throw new BadRequestError("Id must be a number");

    // Pagination input
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    // Call updated model function
    const {
      reviews,
      totalReviews,
      totalPages,
      currentPage,
    } = await Reviews.getReviewsForOneProduct(id, page, limit);

    // Calculate average rating (per page of results)
    const sum = reviews.reduce((acc, { rating }) => acc + rating, 0);
    const averageRating = sum / reviews.length || 0;

    return res.status(200).json({
      success: true,
      pagination: {
        totalReviews,
        totalPages,
        currentPage,
        limit,
      },
      averageRating,
      reviews,
    });

  } catch (err) {
    return next(err);
  }
};


// @desc      Get reviews from product
// @route     GET /api/v1/reviews/product/:id
// @access    Private/Admin ?????????
// exports.getReviewsForProduct = async (req, res, next) => {
//   try {
//     let totalReviews = 0;
//     let averageRating = 0;
//     let reviews = [];
//     let sum = 0;
//     const id = Number(req.params.id);

//     if(isNaN(id)) throw new BadRequestError("Id must be a number");
    
//     reviews = await Reviews.getReviewsForOneProduct(id);
//     totalReviews = reviews.length;
//     sum = reviews.reduce( (acc, {rating}) => acc + rating, 0 ); // add up all the ratings
//     averageRating = sum / totalReviews || 0; // get the average rating
    
//     return res.status(200).json({
//       success: true,
//       totalReviews,
//       averageRating,
//       reviews
//     });

//   } catch (err) {
//     return next(err);
//   }
// };

// @desc      Get single review
// @route     GET /api/v1/reviews/product/:productId/:username
// @access    Private/Admin ?????????
exports.getReview = async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);

    if(isNaN(productId)) throw new BadRequestError("Id must be a number");

    const review = await Reviews.getSingleReview(productId, req.params.username);

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
    const productId = Number(req.params.productId);
    const username = req.params.username;
    const {review, rating} = req.body;

    if(isNaN(productId)) throw new BadRequestError("Id must be a number");

    const rev = await Reviews.addReview(productId, username, review, rating);

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
    const productId = Number(req.params.productId);
    const username = req.params.username;
    const {review, rating} = req.body;

    if(isNaN(productId)) throw new BadRequestError("Id must be a number");

    const updatedReview = await Reviews.updateReview(productId, username, review, rating);

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
    const productId = Number(req.params.productId);
    const username = req.params.username;

    const {success, review} = await Reviews.deleteReview(productId, username);

    const statusCode = success ? 200 : 204;

    return res.status(statusCode).json({ 
      success,
      result: review
    });
  } catch (err) {
    return next(err);
  }
}