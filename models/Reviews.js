"use strict";

const db = require("../db.js");

const {
  NotFoundError,
  BadRequestError,
//   UnauthorizedError,
//   BadRequestError,
//   ForbiddenError,
//   UnprocessableEntityError
} = require("../AppError.js");

class Reviews {
  // GETS SINGLE REVIEW
  static async getSingleReview(productId, userId) {
    // pg statement
    const queryStatement = `SELECT 
                              product_id AS "productId",
                              user_id AS "userId",
                              review,
                              rating,
                              created_at AS "createdAt",
                              updated_at AS "updatedAt"
                            FROM reviews
                            WHERE product_id = $1 AND user_id = $2`;
    // pg values
    const queryValues = [productId, userId];
    // pg query
    const result = await db.query(queryStatement, queryValues);
    
    return (result.rows.length === 0) ? {} : result.rows[0];
  };

  // GETS REVIEW FOR A PRODUCT
  static async getReviewsForOneProduct(prodId) { 
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
  };

  // ADDS REVIEW
  static async addReview(prodId, userId, review, rating) { 
    // pg statement
    const queryStatement = `INSERT INTO reviews (product_id, user_id, review, rating)
                            VALUES ($1, $2, $3, $4)
                            RETURNING 
                              product_id AS "productId", 
                              user_id AS "userId", 
                              review,
                              rating,
                              created_at AS "createdAt",
                              updated_at AS "updatedAt"`;
    // pg values
    const values = [prodId, userId, review, rating];
    const result = await db.query(queryStatement, values);

    if(result.rows.length === 0) throw new BadRequestError("Something went wrong");
    return result.rows[0];
  };

  static async updateReview(prodId, userId, review, rating) { 
    if(review.length === 0 & rating === 0) throw new BadRequestError("No Data");

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
  };

  // DELETE REVIEW
  static async deleteReview(prodId, userId) {
    // pg statement
    const queryStatement = `DELETE FROM reviews 
                            WHERE product_id = $1 AND user_id = $2 
                            RETURNING 
                              user_id AS "userId",
                              product_id AS "productId",
                              review`;
    // pg values
    const values = [prodId, userId]

    const result = await db.query(queryStatement, values);

    return (result.rows.length === 0) 
          ? { review: `Review with product id ${prodId} user id ${userId} not found`, success: false}
          : { review: result.rows[0], success: true};
  }
};

module.exports = Reviews;