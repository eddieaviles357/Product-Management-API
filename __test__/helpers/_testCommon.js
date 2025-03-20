const bcrypt = require("bcrypt");

const db = require("../../db.js");
const { BCRYPT_WORK_FACTOR } = require("../../config");

let productIds = [],
    categoryIds = [],
    userIdUsername = [],
    addressIds = [];
const username1 = 'west123';
const username2 = 'north123';

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM products");
  await db.query("DELETE FROM categories");
  await db.query("DELETE FROM products_categories");
  await db.query("DELETE FROM users");
  await db.query("DELETE FROM addresses");
  await db.query("DELETE FROM reviews");
  await db.query("DELETE FROM wishlist");
  await db.query("DELETE FROM cart");
  await db.query("DELETE FROM orders");
  await db.query("DELETE FROM order_products");
  await db.query("DELETE FROM payment_details");

  const productDataSeed = ['shirt', 'white short', '10.99', '3', 'https://image.product-management.com/1283859']
  // seeds
  const productsResult = await db.query(`
    INSERT INTO products (sku, product_name, product_description, price, stock, image_url)
    VALUES 
    ($1, $4, $5, $6, $7, $8),
    ($2, $4, $5, $6, $7, $8),
    ($3, $4, $5, $6, $7, $8)
    RETURNING product_id`
    , ['MC10SSMM', 'MC10LSLL', 'XKDFQKEL', productDataSeed[0], productDataSeed[1], productDataSeed[2], productDataSeed[3], productDataSeed[4]]);
  // contains product id
  productIds.splice(0, 0, ...productsResult.rows.map(({product_id}) => product_id));


  const categoriesResult = await db.query(`
    INSERT INTO categories(category) 
    VALUES ('none'), ('expensive'), ('savy')
    RETURNING id`);
  // contains category id
  categoryIds.splice(0, 0, ...categoriesResult.rows.map( ({id}) => id));


  const userResult = await db.query(`
    INSERT INTO users (first_name, last_name, username, password, join_at, last_login_at, email, is_admin) 
    VALUES 
    ('west', 'wes', $1, '$2a$12$S8vO5lapyxXiUUVk2e5WXeQQCyugjUo5J9DWD9mTmfefkbQSdQc9q', '2025-02-25 20:11:06.339921-08', '2025-02-25 20:11:06.339921-08', 'west123@123.com', true),
    ('north', 'nor', $2, '$2a$12$S8vO5lapyxXiUUVk2e5WXeQQCyugjUo5J9DWD9mTmfefkbQSdQc9q', '2025-02-25 20:11:06.339921-08', '2025-02-25 20:11:06.339921-08', 'north123@123.com', false)
    RETURNING id, username`, [username1, username2]);
  // contains user id
  userIdUsername.splice(0, 0, ...userResult.rows.map( ({id, username}) => ({id, username}) ));

  const addressResult = await db.query(`
    INSERT INTO addresses (user_id, address_1, address_2, city, state, zipcode)
    VALUES
    ($1, '101 dolly', '', 'Dalmation', 'MI', '01234'),
    ($2, '201 disney st', '', 'Santa Ana', 'CA', '92626')
    RETURNING id`
    , [ userIdUsername[0].id, userIdUsername[1].id ] );
  // contains id
  addressIds.splice(0, 0, ...addressResult.rows.map(({id}) => id));


  await db.query(`
    INSERT INTO reviews (product_id, user_id, review, rating)
    VALUES
    ($1, $3, 'nice item', 1),
    ($2, $3, 'nice item', 2),
    ($1, $4, 'horrible', 5)`
    , [ productIds[0], productIds[1], userIdUsername[0].id, userIdUsername[1].id ]);

  await db.query(`
    INSERT INTO wishlist (user_id, product_id) VALUES ($1, $3),($1, $4),($2, $3)`
    , [ userIdUsername[0].id, userIdUsername[1].id, productIds[0], productIds[1] ]);

  await db.query(`
    INSERT INTO products_categories (product_id, category_id)
    VALUES
    ($1, $3),
    ($2, $4)`
    , [ productIds[0], productIds[1], categoryIds[0], categoryIds[1] ]);

  await db.query(`
    INSERT INTO cart (user_id, product_id, quantity, price)
    VALUES
    ($1, $2, $3, $4)`
    , [ userIdUsername[0].id, productIds[0], 1, 2.00 ]);
};

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}


module.exports = {
  productIds,
  categoryIds,
  userIdUsername,
  addressIds,
  username1,
  username2,
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
};