"use strict";

const db = require("../db");
const {BadRequestError} = require("../AppError");

// check if username already exists. If so, get the id reference
// Returns user id type Number
const getUserId = async (username) => {
  const userResult = await db.query(`SELECT id FROM users WHERE username = $1`, [username]);

  if(userResult.rows.length === 0) throw new BadRequestError(`User ${username} does not exist`);
  const userId = userResult.rows[0].id;
  return userId;
}

module.exports = getUserId;