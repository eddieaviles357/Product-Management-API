"use strict";

const db = require("../db");
const {BadRequestError} = require("../AppError");
const getUserId = require("../helpers/getUserId");

class Cart {
  /**
   * Private method to get the price of a product by productId
   * @param {number} productId 
   * @returns {number|null} price of the product or null if not found
   */
  static async _getPrice(productId) {
    try {
      // get product price
      if(productId === null) throw new BadRequestError(`Invalid productId provided`); // ensure productId is valid
      const result = await db.query(`SELECT price FROM products WHERE product_id = $1`, [productId]);
      return (result.rows.length === 0) ? null : Number(result.rows[0].price);
      // price from db is returned as a string we have to cast to Int
    } catch (err) {
      if(err instanceof BadRequestError) throw err;
      throw new BadRequestError("Something went wrong");
    }
  }

  /**
   * Get cart items for a given username
   * @param {string} username
   * @returns {Array} Array of cart items or empty array if no items found
   */
  static async get(username) {
    /** Returns [{ id: Int, userId: Int, productId: Int, quantity: Int, price: String, addedAt: Date, updatedAt: Date}]
     or [] 
    */
    try {
      if(!username) throw new BadRequestError(`Invalid username provided`);
      const userId = await getUserId(username);
      if(userId === 0 || !userId) throw new BadRequestError("User does not exist");

      const queryStatement = `SELECT 
                                id, 
                                user_id AS "userId", 
                                product_id AS "productId", 
                                quantity,
                                price,
                                added_at AS "addedAt", 
                                updated_at AS "updatedAt"
                              FROM cart
                              WHERE user_id = $1`;
      const cartResult = await db.query(queryStatement, [userId]);
      return (cartResult.rows.length === 0) ? [] : cartResult.rows;
    } catch (err) {
      if(err instanceof BadRequestError) throw err;
      throw new BadRequestError("Something went wrong");
    }
  }

  /**
   * Clear the cart for a given username
   * @param {string} username
   * @returns {boolean} true if cart was cleared, false if no items were found to remove
   */
  static async clear (username) {
    try {
      if(!username) throw new BadRequestError(`Invalid username provided`);
      const userId = await getUserId(username);
      if(userId === 0 || !userId) throw new BadRequestError("User does not exist");

      const removedResult = await db.query(`DELETE FROM cart WHERE user_id = $1 RETURNING *`, [userId]);
      
      return (removedResult.rows.length > 0) ? true : false; 
    } catch (err) {
      if(err instanceof BadRequestError) throw err;
      throw new BadRequestError("Something went wrong");
    }
  }

  /**
   * Add a product to the cart for a given username
   * @param {string} username 
   * @param {number} productId 
   * @param {number} quantity 
   * @returns {Object} the cart item added or existing one if already present
   */
  static async addToCart(username, productId, quantity = 1) {
    try {
      if(!username) throw new BadRequestError(`Invalid username provided`);
      let price;
      const userId = await getUserId(username);
      if(userId === 0 || !userId) throw new BadRequestError("User does not exist");

      price = await Cart._getPrice(productId);

      if(!price) throw new BadRequestError(`Item ${productId} does not exist`); // ensure the product exists in db
      price *= quantity; // multiply the price by the quantity to get the total price for the cart item

      const cartItemResult = await db.query(`SELECT user_id AS "userId", product_id AS "productId", quantity, price FROM cart WHERE user_id = $1 AND product_id = $2`, [userId, productId]);
      if(cartItemResult.rows.length > 0) return cartItemResult.rows[0];

      // add product to cart using user id, product id, and price
      const queryStatement = `INSERT INTO cart(user_id, product_id, quantity, price) 
                              VALUES($1, $2, $3, $4) 
                              RETURNING user_id AS "userId", product_id AS "productId", quantity, price`;
      const values = [userId, productId, quantity, price];
      const cartResult = await db.query(queryStatement, values);

      return cartResult.rows[0];
    } catch (err) {
      if(err instanceof BadRequestError) throw err;
      throw new BadRequestError("Something went wrong");
    }
  }

  /**
   * Update the quantity of a cart item for a given username
   * @param {string} username 
   * @param {number} productId 
   * @param {number} quantity 
   * @returns {Object} the updated cart item or {} if nothing was updated
   */
  static async updateCartItemQty(username, productId, quantity = 0) {
    // if item Qty is 0 then it will be removed from the cart and will return {}
    // returns { user_id: Int, product_id: Int, quantity: Int, price: String }
    try {
      if(!username) throw new BadRequestError(`Invalid username provided`);
      let price;
      let qty;
      const userId = await getUserId(username);
      if(userId === 0 || !userId) throw new BadRequestError("User does not exist");

      price = await Cart._getPrice(productId);

      // get cart item details, if no data exist throw error
      const itemResult = await db.query(`SELECT quantity FROM cart WHERE user_id = $1 AND product_id = $2`, [userId, productId]);
      if(itemResult.rows.length === 0) throw new BadRequestError(`Nothing to update`);

      // Object that contains { quantity, price}
      const { quantity: currentQty } = itemResult.rows[0];
      price = price * ( currentQty + quantity );
      qty = currentQty + quantity;
      
      if(qty <= 0) await db.query(`DELETE FROM cart WHERE user_id = $1 AND product_id = $2`, [userId, productId]);

      // update
      const queryStatement = `UPDATE cart SET
                              quantity = $3,
                              price = $4
                              WHERE user_id = $1 AND product_id = $2
                              RETURNING user_id AS "userId", product_id AS "productId", quantity, price`;
                              
      const values = [userId, productId, qty, price];
      const updatedResult = await db.query(queryStatement, values);

      return updatedResult.rows[0] || {}; // return empty object if nothing was updated
    } catch (err) {
      if(err instanceof BadRequestError) throw err;
      throw new BadRequestError("Something went wrong");
    }
  }

  /**
   * Remove a cart item for a given username and productId
   * @param {string} username 
   * @param {number} productId 
   * @returns {string|number} the id of the deleted cart item or 'Nothing to delete' if no such item exists
   */
  static async removeCartItem (username, productId) {
      // return String | { id: Int }
    try {
      if(!username) throw new BadRequestError(`Invalid username provided`);
      const userId = await getUserId(username);
      if(userId === 0 || !userId) throw new BadRequestError("User does not exist");

      const queryStatement = `DELETE FROM cart WHERE user_id = $1 AND product_id = $2 RETURNING id`;
      const values = [userId, productId];
      const deleteResult = await db.query(queryStatement, values);

      return (deleteResult.rows.length === 0) ? 'Nothing to delete' : deleteResult.rows[0].id;

    } catch (err) {
      if(err instanceof BadRequestError) throw err;
      throw new BadRequestError("Something went wrong");
    }
  }
}

module.exports = Cart;