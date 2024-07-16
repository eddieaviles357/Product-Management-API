const db = require("../db.js");

class Products {
  static async getProducts() {
    const result = await db.query(`
      SELECT * FROM products`);

    console.log('RESULSTS', result)
  }

  static async getProduct(id) {
    const result = await db.query(`
      SELECT
        sku,
        p_name AS name,
        p_description AS description,
        p_price AS price,
        p_image_url AS imageURL,
        created_at AS createdAt
      WHERE id = $1
    `, [id]);
  }

}

module.exports = Products;