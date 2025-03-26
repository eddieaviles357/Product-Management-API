"use strict";

const db = require("../db");
const {BadRequestError} = require("../AppError");

// check if username already exists. If so, get the id reference
// Returns user id type Number
const getUserId = async (username) => {
  try {
    const userResult = await db.query(`SELECT id FROM users WHERE username = $1`, [username]);
  
    // return 0 is no user exist
    return (userResult.rows.length === 0) ? 0 : userResult.rows[0].id
  } catch (err) {
    throw new BadRequestError(err.message);
  }
}

module.exports = getUserId;
