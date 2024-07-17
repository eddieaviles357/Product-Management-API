const db = require("../db.js");

/*
gets all products, limit is to be set for pagination
returns [
  {sku, name, description, price, imageURL, createdAt}, 
  {...}
  ]
*/
class Products {
  static async getProducts() {
    const result = await db.query(`
      SELECT * FROM products`);

    const products = result.rows;

    return products;
  }

/*
gets product using an id
returns { sku, name, description, price, imageURL, createdAt }

*/
  static async findProductById(id) {
    const result = await db.query(`
      SELECT
        sku,
        p_name AS name,
        p_description AS description,
        p_price AS price,
        p_image_url AS imageURL,
        created_at AS createdAt
      FROM products
      WHERE p_id = $1
    `, [id]);
    
    return result.rows[0]
  }

  /*
  adds a new product to db

  */
  static async addProduct(product) {
    const { sku, name, description, price, imageURL } = product;

    const result = await db.query(`
      INSERT INTO products (sku, p_name, p_description, p_price, p_image_url, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      `, [sku, name, description, price, imageURL])   
  }
}

module.exports = Products;