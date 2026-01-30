
function getWishList() {
  return `SELECT 
            p.product_id AS "productId",
            p.product_name AS "productName",
            p.price AS "productPrice",
            p.image_url AS "productImageUrl"
          FROM wishlist w
          JOIN products p ON w.product_id = p.product_id
          WHERE w.user_id = $1`;
}

function insertIntoWishlist() {
  return `INSERT INTO wishlist(user_id, product_id) 
          VALUES($1, $2) 
          RETURNING user_id AS "userId", product_id AS "productId"`;
}

function deleteWishList() {
  return `DELETE FROM wishlist WHERE user_id = $1`;
}

function deleteSingleItem() {
  return `DELETE FROM wishlist 
          WHERE user_id = $1 AND product_id = $2
          RETURNING 
            user_id AS "userId",
            product_id AS "productId"`;
}

module.exports = {
  getWishList,
  insertIntoWishlist,
  deleteWishList,
  deleteSingleItem
};