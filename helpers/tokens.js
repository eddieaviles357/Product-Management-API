"use strict";

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { BadRequestError } = require("../AppError");

// return signed JWT token from user data
const createToken = (user) => {
  console.assert(user?.isAdmin !== undefined, "create token passed without isAdmin property");

  if (!user || typeof user !== "object") {
    return Promise.reject(new BadRequestError("User data is required to create a token"));
  }

  const { username, isAdmin } = user;

  if (!username) {
    return Promise.reject(new BadRequestError("Username is required"));
  }

  if (isAdmin === undefined) {
    return Promise.reject(new BadRequestError("isAdmin property is required"));
  }
  
  const payload = {
    username,
    isAdmin: Boolean(isAdmin)
  };

  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      SECRET_KEY,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) {
          return reject(new BadRequestError("Error creating token"));
        }
        resolve(token);
      }
    );
  });
}

module.exports = createToken;