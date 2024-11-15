"use strict";

const Users = require("../models/Users");
const { BadRequestError } = require("../AppError");
const createToken = require("../helpers/tokens");

// @desc      Registers a new user to the database
// @route     POST /api/v1/auth
// @access    Private/Admin ?????????
exports.registerUser = async (req, res, next) => {
  try {
    const body = req.body
    const newUser = await Users.register(body);
    const token = createToken(newUser);

    return res.status(201).json({ 
      result: newUser, 
      token 
    });
    } catch(err) {
      return next(err);
    }
  };

// @desc      Creates a token when user is autherized
// @route     POST /api/v1/auth/token
// @access    Private/Admin ?????????
exports.token = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await Users.authenticate(username, password);
    const token = createToken(user);
    
    return res.json({ result: user, token });
  } catch (err) {
    return next(err);
  }
}