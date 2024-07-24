const db = require("../db.js");

/*
gets all products, ** LIMIT TO BE SET FOR PAGINATION **
returns [
  {sku, name, description, price, imageURL, createdAt}, 
  {...}
  ]
*/
class Products {
  static async getProducts() {
    const result = await db.query(`
      SELECT 
        p_id AS id,
        sku,  
        p_name AS name,
        p_description AS description,
        p_price AS price,
        p_image_url AS image_url,
        created_at AS created_at
      FROM products`);

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
        p_id AS id,
        sku,
        p_name AS name,
        p_description AS description,
        p_price AS price,
        p_image_url AS image_url,
        created_at AS created_at
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