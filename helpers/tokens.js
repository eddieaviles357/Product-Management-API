"use strict";

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { BadRequestError } = require("../AppError");

// return signed JWT token from user data
const createToken = (user) => {
  console.assert(user?.isAdmin !== undefined, "create token passed without isAdmin property");
  
  const payload = {
    username: user?.username,
    isAdmin: user?.isAdmin || false
  };

  if(!user.username) throw new BadRequestError('No username');
  return jwt.sign(payload, SECRET_KEY);
}

module.exports = createToken;