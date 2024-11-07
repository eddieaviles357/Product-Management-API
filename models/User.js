"use strict";

const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");

class User {

  static async register({firstName, lastName, username, password, email, isAdmin}) {
    try {
      const salt = await bcrypt.genSalt(BCRYPT_WORK_FACTOR);
      const hashedPassword = await bcrypt.hash(password, salt);
      console.log("SALT: ", salt);
      console.log("HASHED_PASSWORD: ", hashedPassword);
    } catch (err) {
      console.log("ERROR\n", err);
    }
  }
};

module.exports = User;