"use strict";

const db = require("../db.js");
const { BadRequestError, ConflictError, NotFoundError } = require("../AppError");
const getUserId = require("../helpers/getUserId");

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
      if (!prodId) throw new BadRequestError("Missing product id");

      // validate product exists
      const productExist = await db.query(
        `SELECT 1 FROM products WHERE product_id = $1`,
        [prodId]
      );
      
      if (productExist.rows.length === 0)
        throw new BadRequestError("Product does not exist");

      // sanitize pagination inputs
      page = Math.max(1, Number(page) || 1);
      limit = Math.max(1, Number(limit) || 10);
      const offset = (page - 1) * limit;


      const queryStatement = `
        SELECT 
          r.product_id AS "productId",
          r.user_id AS "userId",
          u.first_name AS "firstName",
          r.review,
          r.rating,
          r.created_at AS "createdAt",
          r.updated_at AS "updatedAt",
          COUNT(*) OVER() AS "totalReviews"
        FROM reviews r
        JOIN users u ON u.id = r.user_id
        WHERE r.product_id = $1
        ORDER BY r.created_at DESC
        LIMIT $2 OFFSET $3
      `;
      const result = await db.query(queryStatement, [prodId, limit, offset]);

      const totalReviews = +result.rows[0]?.totalReviews ?? 0;
      const totalPages = Math.ceil(totalReviews / limit);


      return {
        data: result.rows.map( ({ totalReviews, ...row }) => row ), // remove totalCount from each row
        pagination: {
          currentPage: page,
          pageSize: limit,
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
      
      const queryStatement =  `INSERT INTO reviews (product_id, user_id, review, rating)
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
                                review,
                                rating`;
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