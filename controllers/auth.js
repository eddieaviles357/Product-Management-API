"use strict";

const Auth = require("../models/Auth");
const Users = require("../models/Users");
const { BadRequestError } = require("../AppError");
const createToken = require("../helpers/tokens");
const emailVerification = require("../services/emailVerification");

// @desc      Creates a token when user is authorized
// @route     POST /api/v1/auth/authenticate
// @access    Public (but requires valid username/password)
exports.authenticateUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await Auth.authenticate(username, password);
    const token = await createToken(user);
    
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
};

// @desc      Verifies user email using token
// @route     POST /api/v1/auth/verify-email
// @access    public (token is the only requirement)
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    const verificationResult = await emailVerification.verifyTokenAndActivate(token);
    
    return res.json({ verifiedAt: verificationResult.verifiedAt });
  } catch (err) {
    return next(err);
  }
};

/********************* NEEDS TEST UPDATING ****************** */

// @desc      Resends email verification token
// @route     POST /api/v1/auth/resend-verification
// @access    public (but requires valid email in body)
exports.resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    await emailVerification.resendVerificationEmail(email);
    
    return res.json({ success: true, message: "Verification email resent" });
  } catch (err) {
    return next(err);
  }
};

// ********************* PASSWORD RESET ****************** Needs test updating


// @desc     Initiates password reset process
// @route    POST /api/v1/auth/password-reset
// @access   public (but requires valid email in body)
exports.initiatePasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    const resetResult = await Auth.initiatePasswordReset(email);
    
    return res.json(resetResult);
  } catch (err) {
    return next(err);
  }
};

// @desc     Resets password using token
// @route    POST /api/v1/auth/password-reset/confirm
// @access   public (but requires valid token and new password in body)
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const resetResult = await Auth.resetPassword(token, newPassword);
    
    return res.json(resetResult);
  } catch (err) {
    return next(err);
  }
};