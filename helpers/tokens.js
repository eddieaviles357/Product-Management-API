"use strict";

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { BadRequestError } = require("../AppError");
const crypto = require("crypto");
const { promisify } = require("util");

const jwtSign = promisify(jwt.sign);
const validateUsername = require("./validateUsername");

// return signed JWT token from user data
const createToken = async (user) => {
  console.assert(user?.isAdmin !== undefined, "create token passed without isAdmin property");

  if (!user || typeof user !== "object") {
    throw new BadRequestError("User data is required to create a token");
  }

  const { username, isAdmin } = user;

  validateUsername(username);

  if (isAdmin === undefined) {
    throw new BadRequestError("isAdmin property is required");
  }
  
  const payload = {
    username,
    isAdmin: Boolean(isAdmin), // strict boolean
    jti: crypto.randomUUID()   // Adds a unique token ID
  };

  try {
    const token = await jwtSign(payload, SECRET_KEY, { expiresIn: "1h" });
    return token;
  } catch (err) {
    throw new BadRequestError(err.message);
  }
}

module.exports = createToken;