"use strict";

const Users = require("../models/Users");
const { BadRequestError } = require("../AppError");
const createToken = require("../helpers/tokens");
const emailVerification = require("../helpers/emailVerification");

// @desc      Registers a new user to the database, create a verification token, and sends verification email.
// @route     POST /api/v1/auth/register
// @access    Private/Admin ?????????
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

// @desc      Creates a token when user is authorized
// @route     POST /api/v1/auth/authenticate
// @access    Private/Admin ?????????
exports.authenticateUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await Users.authenticate(username, password);
    const token = await createToken(user);
    
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
};

// @desc      Verifies user email using token
// @route     POST /api/v1/auth/verify-email
// @access    Private/Admin ?????????
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    const verificationResult = await emailVerification.verifyTokenAndActivate(token);
    
    return res.json({ verifiedAt: verificationResult.verifiedAt });
  } catch (err) {
    return next(err);
  }
};


// @desc      Resends email verification token
// @route     POST /api/v1/auth/resend-verification
// @access    Private/Admin ?????????
exports.resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    await emailVerification.resendVerificationEmail(email);
    
    return res.json({ success: true, message: "Verification email resent" });
  } catch (err) {
    return next(err);
  }
};

/********************* NEEDS UPDATING ****************** */
// @desc      Deletes a user from the database
// @route     DELETE /api/v1/auth/:username
// @access    Private/Admin ?????????
// exports.deleteUser = async (req, res, next) => {
//   try {
//     const success = await Users.deleteUser(req.params.username);

//     return res.status(200).json({ 
//       success
//      });
//   } catch (err) {
//     return next(err);
//   }
// };

// @desc      Deletes all users from the database
// @route     DELETE /api/v1/auth
// @access    Private/Admin ?????????
// exports.deleteAllUsers = async (req, res, next) => {
//   try {
//     const success = await Users.deleteAllUsers();

//     return res.status(200).json({ 
//       success
//      });
//   } catch (err) {
//     return next(err);
//   }
// };

// @desc      Get all users from the database
// @route     GET /api/v1/auth
// @access    Private/Admin ?????????
// exports.getAllUsers = async (req, res, next) => {
//   try {
//     const users = await Users.getAllUsers();

//     return res.status(200).json({
//       success: true,
//       users
//     });
//   } catch (err) {
//     return next(err);
//   }
// };

// @desc      Get a user by username from the database
// @route     GET /api/v1/auth/:username
// @access    Private/Admin ????????? 
// exports.getUser = async (req, res, next) => {
//   try {
//     const user = await Users.getUser(req.params.username);

//     return res.status(200).json({
//       success: true,
//       user
//     });
//   } catch (err) {
//     return next(err);
//   }
// };