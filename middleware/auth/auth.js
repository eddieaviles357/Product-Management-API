"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../../config");
const { UnauthorizedError } = require("../../AppError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    console.log("REQ[ HEADERS ]\n", req.headers);
    console.log("REQ[ HEADERS ][ AUTHORIZATION ]\N", req.headers.authorization);
    const authHeader = req.headers && req.headers.authorization;
    console.log("AUTHHEADER", authHeader);
    if (authHeader) {
      console.log("authHeader is TRUE");
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    console.log("RES[ LOCALS ][ USER ]\n", res.locals.user);
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use when they must be Admin.
 * 
 * If not admin raise Unauthorized
 */
function ensureAdmin(req, res, next) {
  try {
    console.log("res[ locals ][ user ][ isAdmin ]\n", res.locals.user.isAdmin)
    if (res.locals.user.isAdmin === false) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use when they must be Current user or Admin.
 * 
 * If not current user or admin raise Unauthorized
 */
function ensureUserOrAdmin(req, res, next) {
  try {
    console.log("res.locals.user\n", res.locals.user);
    console.log("req.params.username", req.params.username);

    const {isAdmin, username} = res.locals.user
    if (!isAdmin && username !== req.params.username) {
      throw new UnauthorizedError();
    }
    return next();
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureUserOrAdmin
};