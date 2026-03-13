"use strict";

const Address = require("../models/Address");

/**
 * @desc      Get user address
 * @route     GET /api/v1/address/:username
 * @access    Private
 */
exports.getAddress = async (req, res, next) => {
  try {
    const address = await Address.getAddress(req.params.username);

    return res.status(200).json({ success: true, address });
  } catch (err) {
    return next(err);
  }
};

/**
 * @desc      Create or update user address
 * @route     POST /api/v1/address/:username
 * @access    Private
 */
exports.upsertAddress = async (req, res, next) => {
  try {
    const address = await Address.upsertAddress(req.params.username, req.body);

    return res.status(200).json({ success: true, address });
  } catch (err) {
    return next(err);
  }
};

/**
 * @desc      Delete user address
 * @route     DELETE /api/v1/address/:username
 * @access    Private
 */
exports.deleteAddress = async (req, res, next) => {
  try {
    const result = await Address.deleteAddress(req.params.username);

    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
};
