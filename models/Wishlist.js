"use strict";

const db = require("../db");
const { 
  BadRequestError, 
  ConflictError, 
  NotFoundError 
} = require("../AppError");

const Users = require("./Users");
const ensureProductExistInDB = require("../helpers/isProductInDB");
const Queries = require("../queries/wishListQueries");

class Wishlist {
  /**
   * @param {string} username 
   * @returns {array} wishlist items
   * @throws {BadRequestError} if username missing
   * @throws {BadRequestError} if user does not exist
   */
  static async getWishlist(username) {
    try {
      const userId = await Users.getUserId(username);

      // Get wishlist using user id
      const wishlistValues = await db.query(Queries.getWishList(), [userId]);
      
      return wishlistValues.rows;
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

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
      const userId = await Users.getUserId(username);

      // Verify product exists in products table
      await ensureProductExistInDB(productId);

      // add product to wishlist using user id and product id
      const wishlistValues = await db.query(Queries.insertIntoWishlist(), [userId, productId]);

      return wishlistValues.rows[0];
    } catch (err) {
      if(err.code === '23505') throw new ConflictError("Product already exists in wishlist");
      throw new BadRequestError(err.message);
    }
  }

  /**
   * @param {string} username
   * @param {number} productId
   * @returns {boolean} true if product was removed, false otherwise
   * @throws {BadRequestError} if username or productId is invalid
   * @throws {BadRequestError} if user does not exist
   * 
   */
  static async removeProductFromWishlist(username, productId) {
    try {
      const userId = await Users.getUserId(username);

      // Delete product from wishlist using user id and product id
      const removedResult = await db.query(Queries.deleteSingleItem(), [userId, productId]);

      // if no rows were removed then we will return false
      return (removedResult.rowCount > 0);
    } catch (err) {
      throw new BadRequestError(err.message);
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
      const userId = await Users.getUserId(username);
      
      // Clear entire wishlist using user id
      const result = await db.query(Queries.deleteWishList(), [userId]);

      // if no rows were removed then we will return false
      return (result.rows.length > 0);

    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }
};

module.exports = Wishlist;