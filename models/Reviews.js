"use strict";

const db = require("../db.js");
const { BadRequestError } = require("../AppError");
const getUserId = require("../helpers/getUserId");

class Reviews {
  // GETS SINGLE REVIEW
  static async getSingleReview(productId, username) {
    try{
      const userId = await getUserId(username);

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
      throw new BadRequestError(err.message);
    }
  };

  // GETS REVIEWS FOR A PRODUCT
  static async getReviewsForOneProduct(prodId) { 
    try {
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
      throw new BadRequestError(err.message);
    }
  };

  // ADDS REVIEW
  static async addReview(prodId, username, review, rating) { 
    try {
      const userId = await getUserId(username);

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
      throw new BadRequestError(err.message);
    }
  };

  // UPDATES AN EXISTIN REVIEW
  static async updateReview(prodId, username, review, rating) { 
    try {
      if(review.length === 0 & rating === 0) throw new BadRequestError("No Data");

      const userId = await getUserId(username);

      /************************************
       ****** CHECK IF REVIEW EXIST *******
      ************************************/
      
      // check if there is already a review in the database to update
      const existingReviewStatment = `SELECT 
                                        review,
                                        rating
                                      FROM reviews
                                      WHERE product_id = $1 AND user_id = $2`;
      const existingReviewValues = [prodId, userId];

      const reviewInDbResult = await db.query(existingReviewStatment, existingReviewValues);
      if(reviewInDbResult.rows.length === 0) throw new BadRequestError("No review to update");

      // Review does exists

      // Connvert data to json format then parse
      const existingReview = JSON.stringify(reviewInDbResult.rows[0]);
      const parsedReview = JSON.parse(existingReview);

      // must assign values different names to avoid collisions issues
      const { review: rev } = parsedReview;

      /************************************
       ********** UPDATE REVIEW ***********
      ************************************/

          // pg statment for updating review
      const updateStatement = `UPDATE reviews SET
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
      const updatingValues = [prodId, userId, review, rating, rev];
      const result = await db.query(updateStatement, updatingValues);

      if(result.rows.length === 0) throw new BadRequestError("Something went wrong");
      return result.rows[0];
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  };

  // DELETES A REVIEW
  static async deleteReview(prodId, username) {
    try {
      const userId = await getUserId(username);

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
      throw new BadRequestError(err.message);
    }
  }
};

module.exports = Reviews;