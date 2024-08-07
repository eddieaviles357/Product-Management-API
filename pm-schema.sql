CREATE TABLE products (
  product_id SERIAL PRIMARY KEY,
  sku VARCHAR(8) NOT NULL UNIQUE,
  product_name VARCHAR(30) NOT NULL,
  product_description VARCHAR(255) NOT NULL,
  price NUMERIC(7,2) NOT NULL,
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