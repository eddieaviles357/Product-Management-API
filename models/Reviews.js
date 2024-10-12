"use strict";

const db = require("../db.js");

// const {
//   NotFoundError,
//   UnauthorizedError,
//   BadRequestError,
//   ForbiddenError,
//   UnprocessableEntityError
// } = require("../AppError.js");

class Reviews {

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