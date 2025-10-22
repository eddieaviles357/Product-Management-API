CREATE TABLE products (
  product_id SERIAL PRIMARY KEY,
  sku VARCHAR(8) NOT NULL UNIQUE CHECK(LENGTH(sku) > 0),
  product_name VARCHAR(30) NOT NULL CHECK(LENGTH(product_name) > 0),
  product_description VARCHAR(255) NOT NULL CHECK(LENGTH(product_description) > 0),
  price NUMERIC(7,2) NOT NULL CHECK(price > 0.00),
  stock INTEGER NOT NULL CHECK( stock >= 0 ),
  image_url VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  category VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE products_categories (
  PRIMARY KEY (product_id, category_id),
  product_id INTEGER NOT NULL REFERENCES products ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories ON DELETE CASCADE
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  username VARCHAR(20) UNIQUE NOT NULL,
  password VARCHAR(60) NOT NULL,
  join_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMP NOT NULL DEFAULT NOW(),
  email VARCHAR(50) NOT NULL CHECK (position('@' IN email) > 1),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE addresses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
  address_1 VARCHAR(95) NOT NULL,
  address_2 VARCHAR(95),
  city VARCHAR(35) NOT NULL,
  state VARCHAR(2) NOT NULL,
  zipcode VARCHAR(5) NOT NULL
);

CREATE TABLE reviews (
  PRIMARY KEY (product_id, user_id),
  product_id INTEGER NOT NULL REFERENCES products ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
  review VARCHAR(500) NOT NULL,
  rating SMALLINT NOT NULL CHECK ( rating >= 0 AND rating <= 5),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);








CREATE TABLE wishlist (
  PRIMARY KEY (user_id, product_id),
  user_id INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products ON DELETE CASCADE
);

CREATE TABLE cart (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > -1),
  price NUMERIC(10, 2) NOT NULL CHECK(price > 0.00),
  added_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
  total_amount NUMERIC(10,2) NOT NULL CHECK(total_amount > 0.00),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE order_products (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  total_amount NUMERIC(7,2) NOT NULL CHECK(total_amount > 0.00),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE payment_details (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders ON DELETE CASCADE,
  amount NUMERIC(7,2) NOT NULL CHECK(amount > 0.00),
  status BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);


-- Materialized View for getProducts
CREATE MATERIALIZED VIEW mv_product_list AS
SELECT p.product_id AS id,
       p.sku, 
       p.product_name AS "productName", 
       p.product_description AS "productDescription", 
       p.price, 
       p.stock, 
       p.image_url AS "imageURL", 
       p.created_at AS "createdAt", 
       p.updated_at AS "updatedAt", 
       ARRAY_AGG(DISTINCT c.category) AS categories
FROM products AS p
  JOIN products_categories AS pc ON pc.product_id = p.product_id
  JOIN categories AS c ON c.id = pc.category_id
GROUP BY p.product_id, p.sku, p.product_name, p.product_description, p.price, p.stock, p.image_url, p.created_at, p.updated_at;
-- Example query using the materialized view
-- SELECT * FROM mv_product_list WHERE product_id = 1

-- Materialized View for findProductById
CREATE MATERIALIZED VIEW mv_find_single_product AS
SELECT
    p.product_id AS id,
    p.sku,
    p.product_name AS name,
    p.product_description AS description,
    p.price,
    p.stock,
    p.image_url,
    p.created_at AS "createdAt",
    p.updated_at AS "updatedAt",
    ARRAY_AGG(DISTINCT c.category) AS categories
FROM products p
JOIN products_categories pc ON pc.product_id = p.product_id
JOIN categories c ON c.id = pc.category_id
GROUP BY
    p.product_id,
    p.sku,
    p.product_name,
    p.product_description,
    p.price,
    p.stock,
    p.image_url,
    p.created_at,
    p.updated_at
WITH DATA;
-- Example query using the materialized view
-- SELECT * FROM mv_find_single_product WHERE product_id = 1


-- Functions and Triggers to update the updated_at field on UPDATE
CREATE OR REPLACE FUNCTION update_updated_at_product()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_product_updated_at
    BEFORE UPDATE
    ON
        products
    FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_product();

CREATE OR REPLACE FUNCTION update_updated_at_review()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_review_updated_at
    BEFORE UPDATE
    ON
        reviews
    FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_review();

-- Function and Trigger to refresh materialized views on products table changes
CREATE OR REPLACE FUNCTION refresh_mv_product_list()
    RETURNS TRIGGER AS $$
    BEGIN
        REFRESH MATERIALIZED VIEW mv_product_list;
        RETURN NULL; -- Important for AFTER triggers
    END;
    $$ LANGUAGE 'plpgsql';

CREATE TRIGGER refresh_mv_product_list_trigger
    AFTER INSERT OR UPDATE OR DELETE
    ON products
    FOR EACH STATEMENT
EXECUTE PROCEDURE refresh_mv_product_list();

-- Function and Trigger to refresh materialized views on single product changes
CREATE OR REPLACE FUNCTION refresh_mv_find_single_product()
    RETURNS TRIGGER AS $$
    BEGIN
        REFRESH MATERIALIZED VIEW mv_find_single_product;
        RETURN NULL; -- Important for AFTER triggers
    END;
    $$ LANGUAGE 'plpgsql';

CREATE TRIGGER refresh_mv_find_single_product_trigger
    AFTER INSERT OR UPDATE OR DELETE
    ON products
    FOR EACH STATEMENT
EXECUTE PROCEDURE refresh_mv_find_single_product();

CREATE OR REPLACE FUNCTION refresh_mv_product_list()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW mv_product_list;
    RETURN NULL; -- Important for AFTER triggers
END;
$$ LANGUAGE plpgsql;

-- Views for easier querying
-- CREATE OR REPLACE VIEW product_list AS
--   SELECT p.product_id, p.sku, p.product_name, p.product_description, p.price, p.stock, p.image_url, p.created_at, p.updated_at,
--          COALESCE(AVG(r.rating), 0) AS average_rating,
--          COUNT(r.rating) AS number_of_reviews,
--          JSON_AGG(DISTINCT c.category) AS categories
--   FROM products p
--        LEFT JOIN reviews r ON r.product_id = p.product_id
--        LEFT JOIN products_categories pc ON pc.product_id = p.product_id
--        LEFT JOIN categories c ON c.id = pc.category_id
--   GROUP BY p.product_id, p.sku, p.product_name, p.product_description, p.price, p.stock, p.image_url, p.created_at, p.updated_at;     
-- Example query using the view
-- SELECT * FROM product_list WHERE product_id = 1;

