"use strict";

const db = require("../db");

const {BadRequestError} = require("../AppError");

class Cart {

  static async get(username) {
    try {
      const queryStatement = `SELECT 
                                id, 
                                user_id AS "userId", 
                                product_id AS "productId", 
                                quantity, 
                                added_at AS "addedAt", 
                                updated_at AS "updatedAt"
                              FROM cart
                              WHERE username = $1`;
      const cartResult = await db.query(queryStatement, [username]);
      console.log(cartResult.rows);
      if(cartResult.rows.length === 0) return {}
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }
  static async addToCart(username, productId, quantity = 1) {
    try {
      // check if username already exists. If so, get the id reference
      const userResult = await db.query(`SELECT id FROM users WHERE username = $1`, [username]);
      if(userResult.rows.length === 0) throw new BadRequestError(`User ${username} does not exist`);
      const userId = userResult.rows[0].id;

      // We are only going to allow one product per cart. We will have to use updateCartItemQty to increase the quantity
      const cartItemResult = await db.query(`SELECT user_id, product_id, quantity FROM cart WHERE user_id = $1 AND product_id = $2`, [userId, productId]);
      if(cartItemResult.rows.length > 0) return cartItemResult.rows[0];

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

  static async updateCartItemQty(username, productId, quantity = 0) {
    try {
      // check if username already exists. If so, get the id reference
      const userResult = await db.query(`SELECT id FROM users WHERE username = $1`, [username]);
      if(userResult.rows.length === 0) throw new BadRequestError(`User ${username} does not exist`);
      const userId = userResult.rows[0].id;

      // get cart item details, if no data exist throw error
      const currItemQty = await db.query(`SELECT quantity FROM cart WHERE user_id = $1 AND product_id = $2`, [userId, productId]);
      if(currItemQty.rows.length === 0) throw new BadRequestError(`Nothing to update`);
      const currQty = currItemQty.rows[0].quantity;

      // update qty 
      const queryStatement = `UPDATE cart SET
                              quantity = $4::integer + $3
                              WHERE user_id = $1 AND product_id = $2
                              RETURNING user_id, product_id, quantity`;
                              
      const values = [userId, productId, quantity, currQty];
      const updatedResult = await db.query(queryStatement, values);

      return updatedResult.rows;
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  static async removeCartItem (username, productId) {
    try {
      // check if username already exists. If so, get the id reference
      const userResult = await db.query(`SELECT id FROM users WHERE username = $1`, [username]);
      if(userResult.rows.length === 0) throw new BadRequestError(`User ${username} does not exist`);
      const userId = userResult.rows[0].id;

      const queryStatement = `DELETE FROM cart WHERE user_id = $1 AND product_id = $2 RETURNING id`;
      const values = [userId, productId];
      const deleteResult = await db.query(queryStatement, values);

      if(deleteResult.rows.length === 0) return 'Nothing to delete';
      return deleteResult.rows;
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  static async clearCart (username) {
    try {
      const userResult = await db.query(`SELECT id FROM users WHERE id = $1`, [username]);
      if(userResult.rows.length === 0) throw new BadRequestError(`user ${username} does not exist`);

      const removedResult = await db.query(`DELETE FROM cart WHERE id = $1`, [username])
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }
}

module.exports = Cart;