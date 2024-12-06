'use strict';

const Wishlist = require("../models/Wishlist");
const { BadRequestError } = require("../AppError");


// @desc      Add product to wishlist
// @route     POST /api/v1/wishlist/:username/addToWishlist/:productId
// @access    Private/Admin ?????????
exports.addToWishlist = async (req, res, next) => {
  try {
    const { username, productId } = req.params;
    const wishlist = await Wishlist.addProduct(username, productId);

    return res.status(200).json({success: true, wishlist});
  } catch (err) {
    return next(err);
  }
};
