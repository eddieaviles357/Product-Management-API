"use strict";

const Cart = require("../models/Cart");

exports.addToCart = async (req, res, next) => {
  try {
    const {username, productId} = req.params;
    const result = await Cart.addToCart(username, productId);

    res.status(200).json({success: true, result})
  } catch (err) {
    return next(err);
  }
}