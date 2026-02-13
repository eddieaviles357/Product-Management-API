"use strict";

const db = require("../db");
const {BadRequestError} = require("../AppError");
const getUserId = require("../helpers/getUserId");
const {
  getPrice,
  getCartItems,
  clearCart,
  getCartItem,
  getExistingCartItem,
  insertCartItem,
  updateCartItem,
  deleteCartItem
} = require("../helpers/sql/cartQueries");
// const Product = require("./Products");

class Cart {
  /**
   * Private method to get the price of a product by productId
   * @param {number} productId 
   * @returns {number|null} price of the product or null if not found
   */
  static async _getPrice(productId) {
    try {
      // get product price
      if(productId === null) {
        throw new BadRequestError(`Invalid productId provided`); // ensure productId is valid
      }

      const result = await db.query(getPrice(), [productId]);
      if (result.rows.length === 0) return null;
      
      // price from db is returned as a string we have to cast to Int
      return Number(result.rows[0].price);

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
      if(!username) {
        throw new BadRequestError(`Invalid username provided`);
      }

      const userId = await getUserId(username);

      const result = await db.query(getCartItems(), [userId]);

      return result.rows.length ? result.rows : [];

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
      if(!username) {
        throw new BadRequestError(`Invalid username provided`);
      }

      const userId = await getUserId(username);

      const removedResult = await db.query(clearCart(), [userId]);
      
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
      if(!username) {
        throw new BadRequestError(`Invalid username provided`);
      }

      const userId = await getUserId(username);

      const price = await Cart._getPrice(productId);

      if (!price) {
        throw new BadRequestError(`Product ${productId} does not exist`); // ensure the product exists in db
      }

      const totalPrice = price * quantity; // multiply the price by the quantity to get the total price for the cart item

      // If item already exists, return it
      const cartItemResult = await db.query(getExistingCartItem(), [userId, productId]);
      if(cartItemResult.rows.length > 0) return cartItemResult.rows[0];

      // insert new item
      const cartResult = await db.query(insertCartItem(), [userId, productId, quantity, price]);

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
   * @throws {BadRequestError} if the username is invalid or the product does not exist
   */
  static async updateCartItemQty(username, productId, quantity = 0) {
    try {
      if(!username) {
        throw new BadRequestError(`Invalid username provided`);
      }

      const userId = await getUserId(username);

      const price = await Cart._getPrice(productId);

      if (!price) {
        throw new BadRequestError(`Product ${productId} does not exist`); // ensure the product exists in db
      }
      
      // get cart item details, if no data exist throw error
      const existing = await db.query(getCartItem(), [userId, productId]);

      if (existing.rows.length === 0) {
        throw new BadRequestError(`Nothing to update`);
      }

      const currentQty = existing.rows[0].quantity;
      const newQty = currentQty + quantity;

      if (newQty <= 0) {
        // delete the cart item if quantity is less than or equal to zero
        await db.query(deleteCartItem(), [userId, productId]);
        return {};
      }

      const newPrice = price * newQty;

      const update = await db.query(updateCartItem(), [userId, productId, newQty, newPrice]);

      return update.rows[0] || {}; // return empty object if nothing was updated
      
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
    try {
      if(!username) {
        throw new BadRequestError(`Invalid username provided`);
      }

      const userId = await getUserId(username);

      const result = await db.query(deleteCartItem(), [userId, productId]);

      if (result.rows.length === 0) return 'Nothing to delete';
      
      return result.rows[0].productId;

    } catch (err) {
      if(err instanceof BadRequestError) throw err;
      throw new BadRequestError("Something went wrong");
    }
  }
}

module.exports = Cart;