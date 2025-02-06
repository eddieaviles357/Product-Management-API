"use strict";

const db = require("../db");
const { BadRequestError } = require("../AppError");

const getUserId = require("../helpers/getUserId");

class Wishlist {
  
  static async addProduct(username, productId) {
    try {
      const userId = await getUserId(username);

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
      const userId = await getUserId(username);
      
      // Delete product from wishlist using user id and product id
      const queryStatement = `DELETE FROM wishlist 
                              WHERE user_id = $1 AND product_id = $2
                              RETURNING 
                                user_id AS "userId",
                                product_id AS "productId"`;
      const values = [userId, productId];
      const removedResult = await db.query(queryStatement, values);
      const rowsRemoved = removedResult.rowCount;

      // if no rows were removed then we will return false
      return (rowsRemoved !== 0) ? true : false;
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  static async removeAll(username) {
    try {
      const userId = await getUserId(username);
      
      // Clear entire wishlist using user id
      const queryStatement = `DELETE FROM wishlist WHERE user_id = $1`;
      const removedResult = await db.query(queryStatement, [userId]);
      const rowsRemoved = removedResult.rowCount;

      // if no rows were removed then we will return false
      return (rowsRemoved !== 0) ? true : false;

    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }
};

module.exports = Wishlist;