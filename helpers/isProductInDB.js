"use strict";

const db = require("../db");
const { NotFoundError } = require("../AppError");

const isProductInDB = async (productId) => {
  const prod = await db.query(`SELECT 1 FROM products WHERE product_id = $1 LIMIT 1`, [productId]);
  return prod.rows.length > 0;
}

module.exports = isProductInDB;