"use strict";

const db = require("../db");
const { BadRequestError, ConflictError, NotFoundError } = require("../AppError");

const getUserId = require("../helpers/getUserId");

class Wishlist {
  /**
   * @param {string} username
   * @param {string} username 
   * @returns {array} wishlist
   * @throws {BadRequestError} if username is not provided
   * @throws {BadRequestError} if user does not exist or if there is an error in the query
   * @throws {BadRequestError} if no products found in wishlist
   */
  static async getWishlist(username) {
    try {
      if (!username) throw new BadRequestError("Username is required");

      const userId = await getUserId(username);
      if (!userId) throw new BadRequestError("User does not exist");

      // Get all products in wishlist using user id
      const getWishListQuery = `SELECT 
                                p.product_id AS "productId",
                                p.product_name AS "productName",
                                p.price AS "productPrice",
                                p.image_url AS "productImageUrl"
                              FROM wishlist w
                              JOIN products p ON w.product_id = p.product_id
                              WHERE w.user_id = $1`;
      const values = [userId];
      const wishlistValues = await db.query(getWishListQuery, values);

      if (wishlistValues.rows.length === 0) throw new BadRequestError("No products found in wishlist");
      
      return wishlistValues.rows;
    } catch (err) {
      if(err instanceof BadRequestError) throw err;
      throw new BadRequestError("Something went wrong");
    }
  }
  // static async getWishlistCount(username) {
  //   try {
  //     const userId = await getUserId(username);

  //     // Get count of products in wishlist using user id
  //     const queryStatement = `SELECT COUNT(*) AS "count" FROM wishlist WHERE user_id = $1`;
  //     const values = [userId];
  //     const countResult = await db.query(queryStatement, values);
  //     const count = countResult.rows[0].count;

  //     return count;
  //   } catch (err) {
  //     throw new BadRequestError(err.message);
  //   }
  // }

  /**
   * @param {string} username
   * @param {number} productId
   * @returns {object} wishlist item
   * @throws {BadRequestError} if username or productId is not provided
   * @throws {BadRequestError} if user does not exist or if there is an error in the query
   * @throws {ConflictError} if product already exists in wishlist
   */
  static async addProduct(username, productId) {
    try {
      if (!username) throw new BadRequestError("Username is required");
      productId = Number(productId);
      if (!productId || !Number.isInteger(productId) || productId <= 0) {
        throw new BadRequestError("Product ID must be a positive integer");
      }
      const userId = await getUserId(username);
      if (!userId) throw new BadRequestError("User does not exist");

      // Verify product exists
      const prod = await db.query(`SELECT 1 FROM products WHERE product_id = $1 LIMIT 1`, [productId]);
      if (prod.rows.length === 0) throw new NotFoundError("Product not found");

      // add product to wishlist using user id and product id
      const queryStatement = `INSERT INTO wishlist(user_id, product_id) VALUES($1, $2) RETURNING user_id AS "userId", product_id AS "productId"`;
      const values = [userId, productId];
      const wishlistValues = await db.query(queryStatement, values);

      return wishlistValues.rows[0];
    } catch (err) {
      if(err.code === '23505') throw new ConflictError("Product already exists in wishlist");
      if(err instanceof BadRequestError) throw err;
      throw new BadRequestError("Something went wrong");
    }
  }

  /**
   * @param {string} username
   * @param {number} productId
   * @returns {object} removed product object or message
   * @throws {BadRequestError} if username or productId is not provided
   * @throws {BadRequestError} if user does not exist or if there is an error in the query
   * 
   */
  static async removeProduct(username, productId) {
    try {
      if (!username) throw new BadRequestError("Username is required");
      productId = Number(productId);
      if (!productId || !Number.isInteger(productId) || productId <= 0) {
        throw new BadRequestError("Product ID must be a positive integer");
      }

      const userId = await getUserId(username);
      if (!userId) throw new BadRequestError("User does not exist");

      // Delete product from wishlist using user id and product id
      const queryStatement = `DELETE FROM wishlist 
                              WHERE user_id = $1 AND product_id = $2
                              RETURNING 
                                user_id AS "userId",
                                product_id AS "productId"`;
      const values = [userId, productId];
      const removedResult = await db.query(queryStatement, values);

      // if no rows were removed then we will return false
      return (removedResult.rowCount !== 0)
              ? { product: removedResult.rows[0].productId, success: true}
              : { product: productId, success: false};
    } catch (err) {
      if(err instanceof BadRequestError) throw err;
      throw new BadRequestError("Something went wrong");
    }
  }

  /**
   * @param {string} username
   * @returns {boolean} true if wishlist was cleared, false otherwise
   * @throws {BadRequestError} if username is not provided
   * @throws {BadRequestError} if user does not exist or if there is an error in the query
   */
  static async removeAll(username) {
    try {
      if (!username) throw new BadRequestError("Username is required");
      const userId = await getUserId(username);
      if (!userId) throw new BadRequestError("User does not exist");
      
      // Clear entire wishlist using user id
      const queryStatement = `DELETE FROM wishlist WHERE user_id = $1`;
      const removedResult = await db.query(queryStatement, [userId]);
      const rowsRemoved = removedResult.rowCount;

      // if no rows were removed then we will return false
      return (rowsRemoved !== 0) ? true : false;

    } catch (err) {
      if(err instanceof BadRequestError) throw err;
      throw new BadRequestError("Something went wrong");
    }
  }
};

module.exports = Wishlist;