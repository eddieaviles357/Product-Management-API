function getReviews() {
  return `
        SELECT 
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
      `
}

function getSingleReview() {
  return `SELECT 
            product_id AS "productId",
            user_id AS "userId",
            review,
            rating,
            created_at AS "createdAt",
            updated_at AS "updatedAt"
          FROM reviews
          WHERE product_id = $1 AND user_id = $2`;
}

function addReview() {
  return `INSERT INTO reviews (product_id, user_id, review, rating)
          VALUES ($1, $2, $3, $4)
          RETURNING 
            product_id AS "productId", 
            user_id AS "userId", 
            review,
            rating,
            created_at AS "createdAt",
            updated_at AS "updatedAt"`;
}

function doesReviewExist() {
  return `SELECT 
            review,
            rating
          FROM reviews
          WHERE product_id = $1 AND user_id = $2`;
}

function updateReview() {
  return `UPDATE reviews SET
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
}

function deleteReview() {
  return `DELETE FROM reviews 
          WHERE product_id = $1 AND user_id = $2
          RETURNING 
            user_id AS "userId",
            product_id AS "productId",
            review,
            rating`;
}

module.exports = {
  getReviews,
  getSingleReview,
  addReview,
  doesReviewExist,
  updateReview,
  deleteReview
};