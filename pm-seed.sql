INSERT INTO products (p_id, sku, p_name, p_description, p_price, p_image_url, created_at)
VALUES 
(1, 'MC10SSMM', 'Shirt', 'White short sleeve medium', '10.99', 'https://image.product-management.com/1283859', NOW()),
(2, 'MC10LSLL', 'Shirt', 'White long sleeve large', '10.99', 'https://image.product-management.com/1283860', NOW()),
(3, 'MC12SLMM', 'Shirt', 'Red short sleeve medium', '10.99', 'https://image.product-management.com/1283861', NOW());


INSERT INTO categories ( id,category )
VALUES 
(1, 'expensive'),
(2, 'inexpensive'),
(3, 'xs'),
(4, 'sm'),
(5, 'mm'),
(6, 'll'),
(7, 'xl'),
(8, 'soft'),
(9, 'hard'),
(10, 'white'),
(11, 'black'),
(12, 'red'),
(13, 'yellow'),
(14, 'blue'),
(15, 'ss'),
(16, 'ls');

INSERT INTO products_categories (product_id, category_id)
VALUES
(1, 10),
(1, 5),
(1, 15),
(2, 10),
(2, 6),
(2, 16),
(3, 5),
(3, 12),
(3, 15);

