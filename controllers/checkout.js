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
