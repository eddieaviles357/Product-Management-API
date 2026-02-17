"use strict";

const db = require("../db.js");
const { BadRequestError, ConflictError, NotFoundError } = require("../AppError");
const getUserId = require("../helpers/getUserId");
const validateProductId = require("../helpers/validateProductId");
const ensureProductExistInDB = require("../helpers/isProductInDB");
const Queries = require("../helpers/sql/reviewsQueries");
const sanitizePagination = require("../helpers/sanitizePagination");

class Reviews {

    /**
   * Get paginated reviews for a single product
   *
   * @param {number} prodId
   * @param {number} page
   * @param {number} limit
   * @returns {Object} { reviews, totalReviews, totalPages, currentPage }
   * @throws {BadRequestError}
   */
  static async getReviewsForOneProduct(prodId, page = 1, limit = 10) {
    try {
      validateProductId(prodId);

      const { 
        page: currentPage, 
        limit: pageSize, 
        offset 
      } = sanitizePagination(page, limit);

      const { rows } = await db.query(Queries.getReviews(), [ prodId, pageSize, offset ]);

      const totalReviews = rows.length ? Number(rows[0].totalReviews) : 0;

      const totalPages = Math.ceil(totalReviews / pageSize);
     
      const data = rows.map(({ totalReviews, ...review }) => review);

      return {
        data,
        pagination: {
          currentPage,
          pageSize,
          totalReviews,
          totalPages
        }
      };
      
    } catch (err) {
      if (err instanceof BadRequestError) throw err;
      throw new BadRequestError(err.message);
    }
  }

    /**
   * @param {number} productId
   * @param {string} username
   * @returns {Object} review object
   * @throws {BadRequestError} if productId or username is missing
   * @throws {BadRequestError} if there is an error in the database query
   */
  static async getSingleReview(productId, username) {
    try{
      const pId = validateProductId(productId);

      validateUsername(username);

      const uId = await getUserId(username);
      
      const { rows } = await db.query(Queries.getSingleReview(), [pId, uId]);

      return (rows.length === 0) ? {} : rows[0];
    } catch(err) {
      if(err instanceof BadRequestError) throw err;

      if(err instanceof NotFoundError) throw err;

      throw new BadRequestError(err.message);
    }
  };

  /**
   * @param {number} prodId
   * @param {string} username
   * @param {string} review
   * @param {number} rating
   * @returns {Object} review object
   * @throws {BadRequestError} if prodId, username, review or rating is missing
   * @throws {BadRequestError} if there is an error in the database query
   * @throws {BadRequestError} if review already exists for product
   */
  static async addReview(prodId, username, review, rating) { 
    try {
      if(!prodId || !username || !review || !rating) throw new BadRequestError("Missing data");

      const userId = await getUserId(username);

      if(!userId) throw new BadRequestError("User does not exist");
      
      const values = [prodId, userId, review, rating];

      const { rows } = await db.query(Queries.addReview(), values);

      if(rows.length === 0) throw new BadRequestError("Something went wrong");

      return rows[0];
    } catch (err) {
      if(err.code === '23505') throw new ConflictError("Review for this product already exists");
      
      if(err instanceof BadRequestError) throw err;

      throw new BadRequestError(err.message);
    }
  };

  
  /**
   * @param {number} prodId
   * @param {string} username
   * @param {string} review
   * @param {number} rating
   * @returns {Object} review object
   * @throws {BadRequestError} if prodId, username, review or rating is missing
   * @throws {BadRequestError} if there is an error in the database query
   * @throws {BadRequestError} if review does not exist for product
   */
  static async updateReview(prodId, username, review, rating) { 
    try {
      if(!prodId || !username) throw new BadRequestError("Missing data");
      if(!review && !rating) throw new BadRequestError("Missing data");

      const userId = await getUserId(username);
      
      /************************************
       ****** CHECK IF REVIEW EXIST *******
      ************************************/
      
      // check if there is already a review in the database to update
      const { rows: reviewExistRows } = await db.query(Queries.doesReviewExist(), [prodId, userId]);

      if(reviewExistRows.length === 0) throw new BadRequestError("No review to update");

      // Review does exists

      // Connvert data to json format then parse
      const existingReview = JSON.stringify(reviewExistRows[0]);

      const parsedReview = JSON.parse(existingReview);

      // must assign values different names to avoid collisions issues
      const { review: rev } = parsedReview;

      /************************************
       ********** UPDATE REVIEW ***********
      ************************************/

      // pg statment for updating review
      const updatingReviewValues = [prodId, userId, review, rating, rev];

      const { rows} = await db.query(Queries.updateReview(), updatingReviewValues);

      if(rows.length === 0) throw new BadRequestError("Something went wrong");
      return rows[0];
    } catch (err) {
      if(err instanceof BadRequestError) throw err;
      throw new BadRequestError(err.message);
    }
  };


  /**
   * @param {number} prodId
   * @param {string} username
   * @returns {Object} review object
   * @throws {BadRequestError} if prodId or username is missing
   * @throws {BadRequestError} if there is an error in the database query
   * @throws {BadRequestError} if review does not exist for product
   */
  static async deleteReview(prodId, username) {
    try {
      if(!prodId || !username) throw new BadRequestError("Missing data");

      const uId = await getUserId(username);
      
      
      // check if there is already a review in the database to delete
      // const {rows: reviewExistRows} = await db.query(Queries.doesReviewExist(), [prodId, uId]);

      // if(reviewExistRows.length === 0) throw new BadRequestError("No review to delete");
  
      const result = await db.query(Queries.deleteReview(), [prodId, uId]);
      return (result.rows.length > 0);
    } catch (err) {
      if(err instanceof BadRequestError) throw err;
      throw new BadRequestError(err.message);
    }
  }
};

module.exports = Reviews;