"use strict";

const db = require("../db.js");

const {
  NotFoundError,
//   UnauthorizedError,
//   BadRequestError,
//   ForbiddenError,
//   UnprocessableEntityError
} = require("../AppError.js");

class Reviews {
  // returns single review
  // throws error if no review with vaild id exists
  static async getSingleReview(productId, userId) {
    const result = await db.query(`
      SELECT 
        product_id AS "productId",
        user_id AS "userId",
        review,
        rating,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM reviews
      WHERE product_id = $1 AND user_id = $2
      `, [productId, userId]);
    
    if (result.rows.length === 0) throw new NotFoundError(`No reviews found with product id ${productId} user id ${userId}`);

    return result.rows[0];
  };

  static async getReviewsForOneProduct(prodId) { 
    
    const result = await db.query(`
      SELECT 
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
      WHERE p.product_id = $1
      LIMIT 20;
      `, [prodId]);
    
    return result.rows;
  };

  static async addReview(prodId, userId, review, rating) { 

    const result = await db.query(`
      INSERT INTO reviews (product_id, user_id, review, rating)
      VALUES ($1, $2, $3, $4)
      RETURNING 
        product_id AS "productId", 
        user_id AS "userId", 
        review,
        rating,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `, [prodId, userId, review, rating]);

      if(result.rows.length === 0) throw new NotFoundError(`Could not process review`)
    return result.rows[0];
  };

  static async updateReview(prodId, userId, review, rating) { 
    if(review.length === 0 & rating === 0) return {};

    const reviewInDb = await db.query(`
      SELECT 
        review,
        rating
      FROM reviews
      WHERE product_id = $1 AND user_id = $2
      `, [prodId, userId]);
    
    if(reviewInDb.rows.length === 0) return {};

    const existingReview = JSON.stringify(reviewInDb.rows[0]);
    const parsedReview = JSON.parse(existingReview);

    // must assign values different names to avoid collisions issues
    const { review: rev } = parsedReview;

    const result = await db.query(`
      UPDATE reviews SET
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
        updated_at AS "updatedAt"
      `, [prodId, userId, review, rating, rev]);

      if(result.rows.length === 0) throw new NotFoundError(`Could not process review`)
    return result.rows[0];
  };

  static async deleteReview(prodId, userId) {

    const result = await db.query(`
      DELETE FROM reviews 
      WHERE product_id = $1 AND user_id = $2 
      RETURNING 
        user_id AS "userId",
        product_id AS "productId",
        review
      `, [prodId, userId]);

    return (result.rows.length === 0) 
          ? { review: `Review with product id ${prodId} user id ${userId} not found`, success: false}
          : { review: result.rows[0], success: true};
  }
};

module.exports = Reviews;