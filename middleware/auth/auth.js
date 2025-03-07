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
    // console.log("\n*********AUTHENTICATE_JWT*********\n");
    // console.log("REQ[ HEADERS ]\n", req.headers);
    // console.log("\nREQ[ HEADERS ][ AUTHORIZATION ]\n", req.headers.authorization);
     // LEFT and RIGTH expressions are True so return the RIGHT expression
     // If LEFT expression is False return the LEFT expression
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      /* 
        Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
        strip the first word from value and we are left with just the token
        eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
      */
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);

      // console.log("\nRES[ LOCALS ][ USER ]\n", res.locals.user);
    }
    // console.log("***************************************\n");
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
    // console.log("\n**********ENSURE_LOGGED_IN**********\n");
    // console.log("RES[ LOCALS ][ USER ]\n", res.locals.user);

    if (!res.locals.user || !res.locals.user.isAdmin) throw new UnauthorizedError();

    // console.log("\n************************************\n")
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
    // console.log("\n**********ENSURE_ADMIN**********\n");
    // console.log("RES[ LOCALS ][ USER ][ IS_ADMIN ]\n", res.locals.user.isAdmin)

    if (res.locals.user.isAdmin === false) throw new UnauthorizedError();

    // console.log("\n***********************************\n")
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use when they must be Current user.
 * 
 * If not current user raise Unauthorized
 */
function ensureUser(req, res, next) {
  try {
    const {username} = res.locals.user
    if( username !== req.params.username) throw new UnauthorizedError();
    
    return next();
  } catch (err) {
    return next(err);
  }
};

/** Middleware to use when they must be Current user or Admin.
 * 
 * If not current user or admin raise Unauthorized
 */
function ensureUserOrAdmin(req, res, next) {
  try {
    // console.log("\n**********ENSURE_USER_OR_ADMIN**********\n");
    const {isAdmin, username} = res.locals.user
    console.log(req.params.username)
    console.log("\n*******\nusername === req.params.username = \n", username === req.params.username)
    console.log("\nisAdmin = \n", isAdmin, '\n********')
    if( username === req.params.username || isAdmin) {
      return next();
    }

    throw new UnauthorizedError();
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureUser,
  ensureAdmin,
  ensureUserOrAdmin
};