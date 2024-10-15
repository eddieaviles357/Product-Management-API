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
  static async getSingleReview(reviewId) {
    const result = await db.query(`
      SELECT 
        id,
        product_id AS "productId",
        user_id AS "userId",
        review
      FROM reviews
      WHERE id = $1
      `, [reviewId]);
    
    if (result.rows.length === 0) throw new NotFoundError(`No reviews with id ${reviewId} found`);

    return result.rows[0];
  };

  static async getReviewsForOneProduct(prodId) { 
    
    const result = await db.query(`
      SELECT 
        r.id,
        u.first_name AS "firstName",
        r.review
      FROM reviews r
      JOIN products p ON p.product_id = r.product_id
      JOIN users u ON u.id = r.user_id
      WHERE p.product_id = $1
      LIMIT 20;
      `, [prodId]);
    
    return result.rows;
  };

  
};

module.exports = Reviews;