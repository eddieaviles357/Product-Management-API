"use strict";

const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");
const {
  NotFoundError,
  BadRequestError,
//   UnauthorizedError,
//   BadRequestError,
//   ForbiddenError,
//   UnprocessableEntityError
} = require("../AppError.js");

class Users {

  static async register({firstName, lastName, username, password, email, isAdmin=false}) {
    try {
      // create salt and hash password, we will store this in db
      const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

      const queryStatement = `INSERT INTO users (first_name, last_name, username, password, email, is_admin)
                              VALUES 
                                ($1, $2, $3, $4, $5, $6)
                              RETURNING 
                                id, first_name AS "firstName", last_name AS "lastName", username, email`;
      const queryValues = [firstName, lastName, username, hashedPassword, email, isAdmin];
      // hash password
      // store user in database
      const result = await db.query(queryStatement, queryValues);
      if(result.rows.length === 0) throw new BadRequestError('Invalid, something went wrong');
      return result.rows[0];
    } catch (err) {
      return { error: err.message }
    }
  }
};

module.exports = Users;