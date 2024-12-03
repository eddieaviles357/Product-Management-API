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

CREATE TABLE orders (
  order_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
  amount NUMERIC(7,2) NOT NULL CHECK(price > 0.00),
  order_created_at TIMESTAMP NOT NULL DEFAULT NOW(),
)

CREATE TABLE users_orders (
  PRIMARY KEY (user_id, order_id),
  user_id INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
  order_id INTEGER NOT NULL REFERENCES orders ON DELETE CASCADE
)

CREATE  FUNCTION update_updated_at_product()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_product_updated_at
    BEFORE UPDATE
    ON
        products
    FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_product();

CREATE  FUNCTION update_updated_at_review()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_review_updated_at
    BEFORE UPDATE
    ON
        reviews
    FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_review();