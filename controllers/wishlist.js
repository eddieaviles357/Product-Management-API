'use strict';

const Wishlist = require("../models/Wishlist");
const { BadRequestError } = require("../AppError");


// @desc      Get all products in wishlist
// @route     GET /api/v1/wishlist/:username
// @access    Private/Admin ?????????
exports.getWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.getWishlist(req.params.username);

    return res.status(200).json({success: true, wishlist});
  } catch (err) {
    return next(err);
  }
};

// @desc      Add product to wishlist
// @route     POST /api/v1/wishlist/:username/:productId
// @access    Private/Admin ?????????
exports.addToWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.addProduct(req.params.username, req.params.productId);

    return res.status(200).json({success: true, wishlist});
  } catch (err) {
    return next(err);
  }
};

// @desc      Deletes product to wishlist
// @route     DELETE /api/v1/wishlist/:username/:productId
// @access    Private/Admin ?????????
exports.deleteToWishlist = async (req, res, next) => {
  try {
    const success = await Wishlist.removeProductFromWishlist(req.params.username, req.params.productId);
    
    return res.status(200).json({ 
      success
     });
  } catch (err) {
    return next(err);
  }
};

// @desc      Deletes all products in wishlist
// @route     DELETE /api/v1/wishlist/:username
// @access    Private/Admin ?????????
exports.clearWishlist = async (req, res, next) => {
  try {
    const success = await Wishlist.removeAll(req.params.username);

    return res.status(200).json({ 
      success
     });
  } catch (err) {
    return next(err);
  }
}; 