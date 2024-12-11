"use strict";

const db = require("../db");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError
} = require("../AppError.js");

class Wishlist {
  
  static async addProduct(username, productId) {
    try {
      // check if username exist, if so get the id reference
      const userResult = await db.query(`SELECT id FROM users WHERE username = $1`, [username]);
      if(userResult.rows.length === 0) throw new BadRequestError(`User ${username} does not exist`);
      const userId = userResult.rows[0].id;
      // add product to wishlist using user id and product id
      const queryStatement = `INSERT INTO wishlist(user_id, product_id) VALUES($1, $2) RETURNING user_id, product_id`;
      const values = [userId, productId];
      const wishlistValues = await db.query(queryStatement, values);

      return wishlistValues.rows[0];
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  static async removeProduct(username, productId) {
    try {
      // check if username exist, if so get the id reference
      const userResult = await db.query(`SELECT id FROM users WHERE username = $1`, [username]);
      if(userResult.rows.length === 0) throw new BadRequestError(`User ${username} does not exist`);
      const userId = userResult.rows[0].id;
      
      // Delete product to wishlist using user id and product id
      const queryStatement = `DELETE FROM wishlist 
                              WHERE user_id = $1 AND product_id = $2
                              RETURNING 
                                user_id AS "userId",
                                product_id AS "productId"`;
      const values = [userId, productId];
      const wishlistValues = await db.query(queryStatement, values);

      return wishlistValues.rows[0];
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  static async removeAll(username) {
    try {
      // check if username exist, if so get the id reference
      const userResult = await db.query(`SELECT id FROM users WHERE username = $1`, [username]);
      if(userResult.rows.length === 0) throw new BadRequestError(`User ${username} does not exist`);
      const userId = userResult.rows[0].id;
      
      // Clear entire wishlist using user id
      const queryStatement = `DELETE FROM wishlist WHERE user_id = $1 RETURNING user_id AS "userId"`;
      const removedResult = await db.query(queryStatement, [userId]);

      return removedResult.rows[0];
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }
};

module.exports = Wishlist;