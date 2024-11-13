"use strict";

const Users = require("../models/Users");
const { BadRequestError } = require("../AppError");

// @desc      Registers a new user to the database
// @route     POST /api/v1/users
// @access    Private/Admin ?????????
exports.registerUser = async (req, res, next) => {
  try {
    const body = req.body
    const result = await Users.register(body);

    return res.status(200).json({
      success: true,
      result
    });
    } catch(err) {
      return next(err);
    }
  };