'use strict';

const Wishlist = require("../models/Wishlist");
const { BadRequestError } = require("../AppError");


// @desc      Get all products in wishlist
// @route     GET /api/v1/wishlist/:username
// @access    Private/Admin ?????????
exports.getWishlist = async (req, res, next) => {
  try {
    const { username } = req.params;
    const wishlist = await Wishlist.getWishlist(username);

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
    const { product, success } = await Wishlist.removeProduct(username, productId);
    const message = success 
                      ? `Product id ${product} removed from wishlist` 
                      : `Product id ${product} not found in wishlist`;
    
    return res.status(success ? 200 : 404 ).json({ success, message });
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
    const success = await Wishlist.removeAll(username);
    const message = success ? "Removed" : "Nothing to remove";

    return res.status(200).json({ success, message });
  } catch (err) {
    return next(err);
  }
}; 