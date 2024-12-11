'use strict';

const Wishlist = require("../models/Wishlist");
const { BadRequestError } = require("../AppError");


// @desc      Add product to wishlist
// @route     POST /api/v1/wishlist/:username/:productId
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

// @desc      Deletes product to wishlist
// @route     DELETE /api/v1/wishlist/:username/:productId
// @access    Private/Admin ?????????
exports.deleteToWishlist = async (req, res, next) => {
  try {
    const { username, productId } = req.params;
    const wishlist = await Wishlist.removeProduct(username, productId);

    return res.status(200).json({success: true, wishlist});
  } catch (err) {
    return next(err);
  }
};

// @desc      Deletes all products in wishlist
// @route     DELETE /api/v1/wishlist/:username
// @access    Private/Admin ?????????
exports.clearWishlist = async (req, res, next) => {
  try {
    const username = req.params.username;
    const result = await Wishlist.removeAll(username);

    return res.status(200).json({ success: true, result});
  } catch (err) {
    return next(err);
  }
}; 