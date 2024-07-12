const db = require("../db.js");

class Products {
  static async getProducts() {
    const result = await db.query('SELECT sku FROM products');

    console.log('RESULSTS', result)
  }
}

module.exports = Products;