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
        review,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM reviews
      WHERE id = $1
      `, [reviewId]);
    
    if (result.rows.length === 0) throw new NotFoundError(`No reviews with id ${reviewId} found`);

    return result.rows[0];
  };

  static async getReviewsForOneProduct(prodId) { 
    
    const result = await db.query(`
      SELECT 
        r.product_id AS "productId",
        r.user_id AS "userId",
        u.first_name AS "firstName",
        r.review,
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

  static async addReview(prodId, userId, review) { 

    const result = await db.query(`
      INSERT INTO reviews (product_id, user_id, review)
      VALUES ($1, $2, $3)
      RETURNING 
        product_id AS "productId", 
        user_id AS "userId", 
        review,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `, [prodId, userId, review]);

      if(result.rows.length === 0) throw new NotFoundError(`Could not process review`)
    return result.rows[0];
  };
  
};

module.exports = Reviews;