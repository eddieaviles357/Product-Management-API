"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");
const {
  BadRequestError,
  UnauthorizedError,
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
      
      const user = result.rows[0];
      return user;
      
    } catch (err) {
      if(err.code = '23505') throw new BadRequestError("User already exists");
      throw new BadRequestError(err.message);
    }
  }

  static async authenticate(username, password) { // need to update last login row ***********
    try {
      const userQuery = `SELECT
                          id, 
                          first_name AS "firstName", 
                          last_name AS "lastName", 
                          username, 
                          password,
                          email,
                          is_admin as "isAdmin",
                          join_at AS "joinAt"
                         FROM users
                         WHERE username = $1`;

      const updateQuery = `UPDATE users 
                           SET last_login_at = NOW() 
                           WHERE username = $1 
                           RETURNING last_login_at AS "lastLoginAt"`;
      const userResult = await db.query(userQuery, [username]);
      if(userResult.rows.length === 0) throw new UnauthorizedError("Please register");
      // update last login time
      const lastUpdate = await db.query(updateQuery, [username]);
      const user = userResult.rows[0];
      user.lastLoginAt = lastUpdate.rows[0].lastLoginAt;
  
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
      throw new BadRequestError(err.message);
    }

  }
};

module.exports = Users;