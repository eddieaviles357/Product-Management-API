"use strict";

const db = require("../db.js");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config.js");
const {
  BadRequestError,
  UnauthorizedError,
  ConflictError
} = require("../AppError.js");
const { createAndSendVerification } = require("../helpers/emailVerification.js");
const Queries = require("../helpers/sql/userQueries.js");

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
        throw new BadRequestError(err.message);
    }
  }


/** get user id by username
* @param {string} username
* @returns {number} user id or 0 if user does not exist
* @throws {BadRequestError} if there is a problem with the database query
*/
 static async getUserId(username) {
  try {
    const userResult = await db.query(Queries.getUserId(), [username]);
  
    // return 0 is no user exist
    return (userResult.rows.length === 0) ? 0 : userResult.rows[0].id
  } catch (err) {
    throw new BadRequestError(err.message);
  }
}

};

module.exports = Users;