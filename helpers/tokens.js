"use strict";

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

// return signed JWT token from user data
const createToken = (user) => {

const payload = {
  username: user.username,
  isAdmin: user.isAdmin
};

return jwt.sign(payload, SECRET_KEY);
}

module.exports = createToken;