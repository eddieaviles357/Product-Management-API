"use strict";

const db = require("../db");

const {BadRequestError} = require("../AppError");

class Cart {
  static async addToCart(username, productId, quantity) {
    try {
      // check if username exist, if so get the id reference
      const userResult = await db.query(`SELECT id FROM users WHERE username = $1`, [username]);
      if(userResult.rows.length === 0) throw new BadRequestError(`User ${username} does not exist`);
      const userId = userResult.rows[0].id;
      // add product to cart using user id and product id
      const queryStatement = `INSERT INTO cart(user_id, product_id, quantity) 
                              VALUES($1, $2, $3) 
                              RETURNING user_id, product_id, quantity`;
      const values = [userId, productId, quantity];
      const cartResult = await db.query(queryStatement, values);

      return cartResult.rows[0];
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }
}

module.exports = Cart;