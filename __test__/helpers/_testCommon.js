const bcrypt = require("bcrypt");

const db = require("../../db.js");
const { BCRYPT_WORK_FACTOR } = require("../../config");

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

  // seeds
  const productsResult = await db.query(`
    INSERT INTO products (sku, product_name, product_description, price, stock, image_url)
    VALUES 
    ('MC10SSMM', 'Shirt', 'White short sleeve medium', '10.99', '3', 'https://image.product-management.com/1283859'),
    ('MC10LSLL', 'Shirt', 'White long sleeve large', '10.99', '3', 'https://image.product-management.com/1283860'),
    ('XKDFQKEL', 'Shirt', 'White long sleeve large', '10.99', '3', 'https://image.product-management.com/1283811'),
    ('AABBCCDD', 'Shirt', 'White long sleeve large', '10.99', '3', 'https://image.product-management.com/1283812'),
    ('BBCCDDEE', 'Shirt', 'White long sleeve large', '10.99', '4', 'https://image.product-management.com/1283813'),
    ('CCDDEEFF', 'Shirt', 'White long sleeve large', '10.99', '4', 'https://image.product-management.com/1283814'),
    ('DDEEFFGG', 'Shirt', 'White long sleeve large', '10.99', '4', 'https://image.product-management.com/1283815'),
    ('MC10XXXX', 'Pants', 'Blue athletic cotton large', '20.99', '4', 'https://image.product-management.com/1283861'),
    ('YC10LSLS', 'Pants', 'Blue athletic cotton large', '20.99', '4', 'https://image.product-management.com/1283863'),
    ('YC10LXYS', 'Pants', 'Blue athletic cotton large', '20.99', '4', 'https://image.product-management.com/1283865'),
    ('DC09LLVS', 'Pants', 'Blue athletic cotton large', '20.99', '4', 'https://image.product-management.com/1283866'),
    ('DC10VX03', 'Pants', 'Blue athletic cotton large', '20.99', '3', 'https://image.product-management.com/1283869'),
    ('ABDDFFEE', 'Pants', 'Blue athletic cotton large', '20.99', '3', 'https://image.product-management.com/1283868'),
    ('FFGGHHII', 'Pants', 'Blue athletic cotton large', '20.99', '7', 'https://image.product-management.com/1283801'),
    ('GGHHIIJJ', 'Pants', 'Blue athletic cotton large', '20.99', '7', 'https://image.product-management.com/1283802'),
    ('HHIIJJKK', 'Pants', 'Blue athletic cotton large', '20.99', '7', 'https://image.product-management.com/1283803'),
    ('IIJJKKLL', 'Pants', 'Blue athletic cotton large', '20.99', '7', 'https://image.product-management.com/1283804'),
    ('JJKKLLMM', 'Pants', 'Blue athletic cotton large', '20.99', '7', 'https://image.product-management.com/1283805'),
    ('KKLLMMNN', 'Pants', 'Blue athletic cotton large', '20.99', '7', 'https://image.product-management.com/1283868'),
    ('LLMMNNOO', 'Pants', 'Blue athletic cotton large', '20.99', '7', 'https://image.product-management.com/1283806'),
    ('MMNNOOPP', 'Pants', 'Blue athletic cotton large', '20.99', '7', 'https://image.product-management.com/1283807'),
    ('NNOOPPQQ', 'Pants', 'Blue athletic cotton large', '20.99', '7', 'https://image.product-management.com/1283808'),
    ('OOPPQQRR', 'Pants', 'Blue athletic cotton large', '20.99', '7', 'https://image.product-management.com/1283809'),
    ('MCXXLSXL', 'Shirt', 'Red short sleeve medium', '10.99', '2', 'https://image.product-management.com/1283862')
    RETURNING product_id`);

  const categoryResult = await db.query(`
    INSERT INTO categories (category)
    VALUES 
    ('none'),('expensive'),('inexpensive'),('xs'),('sm'),('mm'),('ll'),('xl'),
    ('soft'),('hard'),('white'),('black'),('red'),('yellow'),('blue'),('ss'),('ls')
    RETURNING id`);

  await db.query(`
    INSERT INTO products_categories (product_id, category_id)
    VALUES
    (1, 10),(1, 5),(1, 15),(2, 10),(2, 6),(2, 16),(3, 5),(4, 12),(5, 15),
    (6, 15),(7, 15),(8, 15),(9, 15),(10, 15),(11, 15),(12, 15),(13, 15),(14, 15),
    (15, 15),(16, 1),(17, 1),(18, 1),(19, 1),(20, 1),(21, 1),(22, 1),(23, 1),(24, 1)`);

    const userResult = await db.query(`
      INSERT INTO users(sku, product_name, product_description, price, stock, image_url)
      VALUES 
      ('west', 'wes', 'west123', $1, NOW(), NOW(), 'west123@123.com', true),
      ('north', 'nor', 'nor123', $2, NOW(), NOW(), 'nor123@123.com', false),
      ('east', 'eas', 'eas123', $3, NOW(), NOW(), 'eas123@123.com', false),
      ('south', 'sou', 'sou123', $4, NOW(), NOW(), 'sou123@123.com', false),
      ('center', 'cen', 'cen123', $5, NOW(), NOW(), 'cen123@123.com', false)
      RETURNING id, username`,
    [
      await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
      await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
      await bcrypt.hash("password3", BCRYPT_WORK_FACTOR),
      await bcrypt.hash("password4", BCRYPT_WORK_FACTOR),
      await bcrypt.hash("password5", BCRYPT_WORK_FACTOR),
    ]);

  const addressesResult = await db.query(`
    INSERT INTO addresses (user_id, address_1, address_2, city, state, zipcode)
    VALUES
    (1, '101 dolly', '', 'dalmation', 'MI', '01234'),
    (2, '201 disney st', '', 'dalmation', 'MI', '01234'),
    (3, '10201 storm blvd', '', 'dalmation', 'MI', '01234'),
    (4, '2004 godville ave', '', 'dalmation', 'MI', '01234'),
    (5, '690 richard st', '', 'dalmation', 'MI', '01234')
    RETURNING id`);

  await db.query(`
    INSERT INTO reviews (product_id, user_id, review, rating)
    VALUES
    (2, 2, 'nice item', 1),
    (2, 3, 'nice item', 2),
    (2, 4, 'nice item', 3),
    (2, 5, 'horrible', 5),
    (3, 2, 'horrible', 3),
    (3, 3, 'horrible', 2),
    (3, 4, 'best item', 5),
    (4, 2, 'best item', 2),
    (4, 3, 'best item', 1),
    (4, 4, 'useless', 5),
    (5, 2, 'useless', 5),
    (5, 3, 'useless', 5)`);

  await db.query(`INSERT INTO wishlist (user_id, product_id) VALUES (1, 1),(1, 2),(1, 3),(1, 4),(2, 4),(3, 4)`);

  // [ids]
  // contains id
  const productIds = productsResult.rows;
  // contains id
  const categoryIds = categoryResult.rows;
  // contains id username
  const userIds = userResult.rows;
  // contains id
  // const addressesIds = addressesResult.rows;
  // contains id
  const addressIds = addressesResult.rows;
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
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
};