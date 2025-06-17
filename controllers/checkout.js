'use strict';

const Orders = require("../models/Orders");
const { BadRequestError } = require("../AppError");


// @desc      Create a new Order
// @route     POST /api/v1/checkout/:username/
// @access    Private/Admin ?????????
exports.createOrder = async (req, res, next) => {
  try {
    const { username } = req.params;
    const cartOrder = req.body || {};
    const order = await Orders.create(username, cartOrder);

    return res.status(200).json({success: order});
  } catch (err) {
    return next(err);
  }
};

// @desc      Get Order by ID
// @route     GET /api/v1/checkout/:username/:orderId
// @access    Private/Admin ?????????
exports.getOrdersById = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Orders.getOrderById(orderId);

    if (!order || order.length === 0) {
      throw new BadRequestError("Order not found");
    }

    return res.status(200).json({success: order});
  } catch (err) {
    return next(err);
  }
};
