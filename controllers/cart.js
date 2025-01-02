"use strict";

const Cart = require("../models/Cart");

exports.addToCart = async (req, res, next) => {
  try {
    const {username, productId} = req.params;
    const {quantity} = req.body ?? undefined;
    const result = await Cart.addToCart(username, productId, quantity);

    res.status(200).json({success: true, result})
  } catch (err) {
    return next(err);
  }
}

exports.updateCartItemQty = async (req, res, next) => {
  try {
    const {username, productId} = req.params;
    const {quantity} = req.body ?? undefined;
    const result = await Cart.updateCartItemQty(username, productId, quantity);
    console.log("\nRESULTS ::: ", result)
    res.status(200).json({success: true, result})
  } catch (err) {
    return next(err);
  }
}