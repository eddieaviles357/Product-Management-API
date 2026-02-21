"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");
const {
  BadRequestError,
  UnauthorizedError,
  ConflictError
} = require("../AppError.js");
const { createAndSendVerification } = require("../helpers/emailVerification");
const Queries = require("../helpers/sql/userQueries");

class Users {
  /**
   * @typedef {Object} userRegistrationData
   * @property {string} firstName
   * @property {string} lastName
   * @property {string} username
   * @property {string} password
   * @property {string} email
   * @property {boolean} isAdmin
   */

  /** register user
   * @param {userRegistrationData} user
   * @returns {object} user
   * @throws {ConflictError} if user already exists
   * @throws {BadRequestError} if there is a problem with the database query
   */
  static async register({firstName, lastName, username, password, email, isAdmin=false}) {
    try {
      if(!firstName || !lastName || !username || !password || !email) {
        throw new BadRequestError("Missing required fields");
      }
      // create salt and hash password, we will store this in db
      const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
      
      const queryValues = [firstName, lastName, username, hashedPassword, email, isAdmin];
      
      // store user in database
      const result = await db.query(Queries.insertUser(), queryValues);
      if(result.rows.length === 0) throw new BadRequestError('Invalid, something went wrong');
      
      // Store verification token separately
      // const verificationResult = await createAndSendVerification({email, username});
      await createAndSendVerification({email, username});

      return result.rows[0];
      
    } catch (err) {
        if(err.code === '23505' || err instanceof ConflictError) throw new ConflictError("User already exists");
        if(err instanceof BadRequestError) throw err;
        throw new BadRequestError(err.message);
    }
  }

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
      if(err instanceof BadRequestError) throw err;
      throw new BadRequestError(err.message);
    }

  }
};

module.exports = Users;