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