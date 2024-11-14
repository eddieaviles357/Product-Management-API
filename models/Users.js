"use strict";

const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
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
                                id, first_name AS "firstName", last_name AS "lastName", username, email, is_admin AS "isAdmin"`;
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

  static async authenticate(username, password) {
    try {
      const userQuery = `SELECT
                          id, 
                          first_name AS "firstName", 
                          last_name AS "lastName", 
                          username, 
                          password,
                          email,
                          is_admin as "isAdmin",
                          join_at AS "joinAt",
                          last_login_at AS "lastLogin"
                         FROM users
                         WHERE username = ${username}`;
      const userResult = await db.query(userQuery, [username]);
      const user = userResult.rows[0];

      // is there a user in db
      if(user) {
        // is user input password the correct password against hashed password
        const isValid = bcrypt.compare(password, user.password);
        // its the correct user now lets delete password we don't need it anymore
        if(!!isValid) {
          delete user.password;
          return user;
        }
      };

      throw new UnauthorizedError("Invalid User");
      
    } catch (err) {
      return { error: err.message };
    }

  }
};

module.exports = Users;