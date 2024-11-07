"use strict";

const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");

class Users {

  static async register({firstName, lastName, username, password, email, isAdmin=false}) {
    try {
      const queryStatement = `INSERT INTO users (first_name, last_name, username, password, email, is_admin
                              VALUES 
                                ($1, $2, $3, $4, $5, $6)
                              RETURNING *`;
      const queryValues = [firstName, lastName, username, password, email, isAdmin];
      // hash password
      const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
      // store user in database
      const result = await db.query(queryStatement, queryValues);
      console.log(result.rows[0]);
    } catch (err) {
      console.log("ERROR\n", err);
    }
  }
};

module.exports = Users;