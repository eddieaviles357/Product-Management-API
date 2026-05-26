"use strict";

const Users = require("../models/Users");
const { BadRequestError } = require("../AppError");
const createToken = require("../helpers/tokens");

// @desc      Registers a new user to the database, create a verification token, and sends verification email.
// @route     POST /api/v1/auth/register
// @access    Public (but requires valid email/username/password)
exports.registerUser = async (req, res, next) => {
  try {
    const body = req.body
    const newUser = await Users.register(body);
    const token = await createToken(newUser);

    return res.status(201).json({ token });
    } catch(err) {
      return next(err);
    }
  };