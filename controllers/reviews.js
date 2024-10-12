'use strict';

const Reviews = require("../models/Reviews");
const { BadRequestError } = require("../AppError");

// @desc      Get reviews for product
// @route     GET /api/v1/reviews/product/:id
// @access    Private/Admin ?????????
exports.getReviewsForProduct = async (req, res, next) => {
  try {console.log(req.params.id)
    const id = Number(req.params.id);

    if(isNaN(id)) throw new BadRequestError("Id must be a number");

    const reviewList = await Reviews.getReviewsForOneProduct(id);

    return res.status(200).json({
      success: true,
      products: reviewList
    });

  } catch (err) {
    return next(err);
  }
};
