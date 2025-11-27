"use strict";

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { BadRequestError } = require("../AppError");

// return signed JWT token from user data
const createToken = (user) => {
  console.assert(user?.isAdmin !== undefined, "create token passed without isAdmin property");

  if (!user || typeof user !== "object") {
    throw new BadRequestError("User data is required to create a token");
  }

  const { username, isAdmin } = user;

  if (!username) {
    throw new BadRequestError("Username is required");
  }

  if (isAdmin === undefined) {
    throw new BadRequestError("isAdmin property is required");
  }

  const payload = {
    username,
    isAdmin: Boolean(isAdmin) // ensures strict boolean
  };

  return jwt.sign(payload, SECRET_KEY, {
    expiresIn: "1h" // Clearly states what the token expiration is
  });
}

module.exports = createToken;