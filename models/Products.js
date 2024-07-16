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

  static async addProduct(product) {
    const { sku, name, description, price, imageURL } = product;

    const result = await db.query(`
      INSERT INTO products (sku, p_name, p_description, p_price, p_image_url, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      `, [sku, name, description, price, imageURL])   
  }
}

module.exports = Products;