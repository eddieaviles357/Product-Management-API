"use strict";

const db = require("../db.js");
const bcrypt = require("bcrypt");
// const { BCRYPT_WORK_FACTOR } = require("../config.js");
const {
  BadRequestError,
  UnauthorizedError,
  ConflictError
} = require("../AppError.js");
const { createAndSendVerification } = require("../services/emailVerification.js");
const Queries = require("../queries/userQueries.js");

class Auth {
  /** authenticate user
   * @param {string} username 
   * @param {string} password 
   * @returns {object} user
   * @throws {UnauthorizedError} if user is not found or password is incorrect
   * @throws {BadRequestError} if there is a problem with the database query
   */
  static async authenticate(username, password) {
    try {
      if(!username || !password) throw new BadRequestError("Missing required fields");

      const userResult = await db.query(Queries.getUser(), [username]);
      if(userResult.rows.length === 0) throw new UnauthorizedError("Please register");
  
      const user = userResult.rows[0];

      // is there a user in db
      if(user) {
        // is user input password the correct password against hashed password
        const isValid = await bcrypt.compare(password, user.password);
        // its the correct user now lets delete password we don't need it anymore
        if(!!isValid) {
          // update last login time
          const lastUpdate = await db.query(Queries.updateUserLoginTimeStamp(), [username]);
          user.lastLoginAt = lastUpdate.rows[0].lastLoginAt;

          delete user.password;
          return user;
        }
      };

      throw new UnauthorizedError("Invalid User");
      
    } catch (err) {
      if(err instanceof UnauthorizedError) throw err;
      throw new BadRequestError(err.message);
    }

  }
};

module.exports = Auth;