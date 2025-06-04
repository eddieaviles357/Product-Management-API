"use strict";

const db = require("../db.js");
const { BadRequestError, ConflictError, NotFoundError } = require("../AppError");
const getUserId = require("../helpers/getUserId");

class Reviews {
  /**
   * @param {number} productId
   * @param {string} username
   * @returns {Object} review object
   * @throws {BadRequestError} if productId or username is missing
   * @throws {BadRequestError} if there is an error in the database query
   */
  static async getSingleReview(productId, username) {
    try{
      if(!productId || !username) throw new BadRequestError("Missing data");
      

      const userId = await getUserId(username);
      if(userId === 0 || !userId) throw new NotFoundError("User does not exist");
      
      const queryStatement = `SELECT 
                                product_id AS "productId",
                                user_id AS "userId",
                                review,
                                rating,
                                created_at AS "createdAt",
                                updated_at AS "updatedAt"
                              FROM reviews
                              WHERE product_id = $1 AND user_id = $2`;
      const queryValues = [productId, userId];
      const result = await db.query(queryStatement, queryValues);
      return (result.rows.length === 0) ? {} : result.rows[0];
    } catch(err) {
      if(err instanceof BadRequestError) throw err;
      if(err instanceof NotFoundError) throw err;
      throw new BadRequestError(err.message);
    }
  };

  // GETS REVIEWS FOR A PRODUCT
  /**
   * @param {number} prodId
   * @returns {Array} array of review objects
   * @throws {BadRequestError} if prodId is missing
   * @throws {BadRequestError} if there is an error in the database query
   */
  static async getReviewsForOneProduct(prodId) { 
    try {
      if(!prodId) throw new BadRequestError("Missing data");

      const product = await db.query(`SELECT product_id FROM products WHERE product_id = $1`, [prodId]);
      if(product.rows.length === 0) throw new BadRequestError("Product does not exist");

      const queryStatement = `SELECT 
                                r.product_id AS "productId",
                                r.user_id AS "userId",
                                u.first_name AS "firstName",
                                r.review,
                                r.rating,
                                r.created_at AS "createdAt",
                                r.updated_at AS "updatedAt"
                              FROM reviews r
                              JOIN products p ON p.product_id = r.product_id
                              JOIN users u ON u.id = r.user_id
                              WHERE p.product_id = $1`;
      const result = await db.query(queryStatement, [prodId]);
      return (result.rows.length === 0) ? [] : result.rows;
    } catch (err) {
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
   * @throws {BadRequestError} if review already exists for product
   */
  static async addReview(prodId, username, review, rating) { 
    try {
      if(!prodId || !username || !review || !rating) throw new BadRequestError("Missing data");
      const userId = await getUserId(username);
      if(userId === 0 || !userId) throw new BadRequestError("User does not exist");
      
      const queryStatement = `INSERT INTO reviews (product_id, user_id, review, rating)
                              VALUES ($1, $2, $3, $4)
                              RETURNING 
                                product_id AS "productId", 
                                user_id AS "userId", 
                                review,
                                rating,
                                created_at AS "createdAt",
                                updated_at AS "updatedAt"`;
      const values = [prodId, userId, review, rating];
      const result = await db.query(queryStatement, values);

      if(result.rows.length === 0) throw new BadRequestError("Something went wrong");
      return result.rows[0];
    } catch (err) {
      if(err.code === '23505') throw new ConflictError("Review for this product already exists");
      if(err instanceof BadRequestError) throw err;
      throw new BadRequestError("Something went wrong");
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
      if(userId === 0 || !userId) throw new BadRequestError("User does not exist");
      
      /************************************
       ****** CHECK IF REVIEW EXIST *******
      ************************************/
      
      // check if there is already a review in the database to update
      const doesReviewExistStatement = `SELECT 
                                        review,
                                        rating
                                      FROM reviews
                                      WHERE product_id = $1 AND user_id = $2`;
      const doesReviewExistValues = [prodId, userId];

      const reviewExist = await db.query(doesReviewExistStatement, doesReviewExistValues);
      if(reviewExist.rows.length === 0) throw new BadRequestError("No review to update");

      // Review does exists

      // Connvert data to json format then parse
      const existingReview = JSON.stringify(reviewExist.rows[0]);
      const parsedReview = JSON.parse(existingReview);

      // must assign values different names to avoid collisions issues
      const { review: rev } = parsedReview;

      /************************************
       ********** UPDATE REVIEW ***********
      ************************************/

      // pg statment for updating review
      const updateReviewStatement = `UPDATE reviews SET
                                review = COALESCE( NULLIF($3, ''), $5 ),
                                rating = $4,
                                updated_at = NOW()
                              WHERE product_id = $1 AND user_id = $2
                              RETURNING 
                                product_id AS "productId", 
                                user_id AS "userId", 
                                review,
                                rating,
                                created_at AS "createdAt",
                                updated_at AS "updatedAt"`;
      const updatingReviewValues = [prodId, userId, review, rating, rev];
      const updatedReview = await db.query(updateReviewStatement, updatingReviewValues);

      if(updatedReview.rows.length === 0) throw new BadRequestError("Something went wrong");
      return updatedReview.rows[0];
    } catch (err) {
      if(err instanceof BadRequestError) throw err;
      throw new BadRequestError("Something went wrong");
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
      const userId = await getUserId(username);
      if(userId === 0 || !userId) throw new BadRequestError("User does not exist");
      
      // check if there is already a review in the database to delete
      const doesReviewExistStatement = `SELECT 
                                        review,
                                        rating
                                      FROM reviews
                                      WHERE product_id = $1 AND user_id = $2`;
      const doesReviewExistValues = [prodId, userId];
      const reviewExist = await db.query(doesReviewExistStatement, doesReviewExistValues);
      if(reviewExist.rows.length === 0) throw new BadRequestError("No review to delete");

      // Review does exists
      const queryStatement = `DELETE FROM reviews 
                              WHERE product_id = $1 AND user_id = $2 
                              RETURNING 
                                user_id AS "userId",
                                product_id AS "productId",
                                review`;
      const values = [prodId, userId]
  
      const result = await db.query(queryStatement, values);
      return (result.rows.length === 0) 
              ? { review: `Review with product id ${prodId} user id ${userId} not found`, success: false} 
              : { review: result.rows[0], success: true};
    } catch (err) {
      if(err instanceof BadRequestError) throw err;
      throw new BadRequestError("Something went wrong");
    }
  }
};

module.exports = Reviews;