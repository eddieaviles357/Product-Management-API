INSERT INTO products (sku, product_name, product_description, price, stock, image_url)
VALUES 
('MC10SSMM', 'Shirt', 'White short sleeve medium', '10.99', '3', 'sunflower/BagOfSunflowerSeeds@0.5x.jpg'),
('MC10LSLL', 'Shirt', 'White long sleeve large', '10.99', '3', 'sunflower/BagOfSunflowerSeeds@0.5x.jpg'),
('XKDFQKEL', 'Shirt', 'White long sleeve large', '10.99', '3', 'sunflower/BagOfSunflowerSeeds@0.5x.jpg'),
('AABBCCDD', 'Shirt', 'White long sleeve large', '10.99', '3', 'sunflower/BagOfSunflowerSeeds@0.5x.jpg'),
('BBCCDDEE', 'Shirt', 'White long sleeve large', '10.99', '4', 'sunflower/BagOfSunflowerSeeds@0.5x.jpg'),
('CCDDEEFF', 'Shirt', 'White long sleeve large', '10.99', '4', 'sunflower/BagOfSunflowerSeeds@0.5x.jpg'),
('DDEEFFGG', 'Shirt', 'White long sleeve large', '10.99', '4', 'sunflower/BagOfSunflowerSeeds@0.5x.jpg'),
('MC10XXXX', 'Pants', 'Blue athletic cotton large', '20.99', '4', 'sunflower/BagOfSunflowerSeeds@0.5x.jpg'),
('YC10LSLS', 'Pants', 'Blue athletic cotton large', '20.99', '4', 'sunflower/BagOfSunflowerSeeds@0.5x.jpg'),
('YC10LXYS', 'Pants', 'Blue athletic cotton large', '20.99', '4', 'sunflower/BagOfSunflowerSeeds@0.5x.jpg'),
('DC09LLVS', 'Pants', 'Blue athletic cotton large', '20.99', '4', 'almonds/BagOfAlmondSeeds@0.5x.jpg'),
('DC10VX03', 'Pants', 'Blue athletic cotton large', '20.99', '3', 'almonds/BagOfAlmondSeeds@0.5x.jpg'),
('ABDDFFEE', 'Pants', 'Blue athletic cotton large', '20.99', '3', 'almonds/BagOfAlmondSeeds@0.5x.jpg'),
('FFGGHHII', 'Pants', 'Blue athletic cotton large', '20.99', '7', 'almonds/BagOfAlmondSeeds@0.5x.jpg'),
('GGHHIIJJ', 'Pants', 'Blue athletic cotton large', '20.99', '7', 'almonds/BagOfAlmondSeeds@0.5x.jpg'),
('HHIIJJKK', 'Pants', 'Blue athletic cotton large', '20.99', '7', 'almonds/BagOfAlmondSeeds@0.5x.jpg'),
('IIJJKKLL', 'Pants', 'Blue athletic cotton large', '20.99', '7', 'almonds/BagOfAlmondSeeds@0.5x.jpg'),
('JJKKLLMM', 'Pants', 'Blue athletic cotton large', '20.99', '7', 'almonds/BagOfAlmondSeeds@0.5x.jpg'),
('KKLLMMNN', 'Pants', 'Blue athletic cotton large', '20.99', '7', 'almonds/BagOfAlmondSeeds@0.5x.jpg'),
('LLMMNNOO', 'Pants', 'Blue athletic cotton large', '20.99', '7', 'almonds/BagOfAlmondSeeds@0.5x.jpg'),
('MMNNOOPP', 'Pants', 'Blue athletic cotton large', '20.99', '7', 'almonds/BagOfAlmondSeeds@0.5x.jpg'),
('NNOOPPQQ', 'Pants', 'Blue athletic cotton large', '20.99', '7', 'almonds/BagOfAlmondSeeds@0.5x.jpg'),
('OOPPQQRR', 'Pants', 'Blue athletic cotton large', '20.99', '7', 'almonds/BagOfAlmondSeeds@0.5x.jpg'),
('MCXXLSXL', 'Shirt', 'Red short sleeve medium', '10.99', '2', 'almonds/BagOfAlmondSeeds@0.5x.jpg');


INSERT INTO categories (category)
VALUES 
('none'),
('expensive'),
('inexpensive'),
('xs'),
('sm'),
('mm'),
('ll'),
('xl'),
('soft'),
('hard'),
('white'),
('black'),
('red'),
('yellow'),
('blue'),
('ss'),
('ls');

INSERT INTO products_categories (product_id, category_id)
VALUES
(1, 10),
(1, 5),
(1, 15),
(2, 10),
(2, 6),
(2, 16),
(3, 5),
(4, 12),
(5, 15),
(6, 15),
(7, 15),
(8, 15),
(9, 15),
(10, 15),
(11, 15),
(12, 15),
(13, 15),
(14, 15),
(15, 15),
(16, 1),
(17, 1),
(18, 1),
(19, 1),
(20, 1),
(21, 1),
(22, 1),
(23, 1),
(24, 1);

INSERT INTO users (first_name, last_name, username, password, join_at, last_login_at, email, is_admin)
VALUES 
('west', 'wes', 'west123', '$2a$12$S8vO5lapyxXiUUVk2e5WXeQQCyugjUo5J9DWD9mTmfefkbQSdQc9q', NOW(), NOW(), 'west123@123.com', true),
('north', 'nor', 'nor123', '$2a$12$S8vO5lapyxXiUUVk2e5WXeQQCyugjUo5J9DWD9mTmfefkbQSdQc9q', NOW(), NOW(), 'nor123@123.com', false),
('east', 'eas', 'eas123', '$2a$12$S8vO5lapyxXiUUVk2e5WXeQQCyugjUo5J9DWD9mTmfefkbQSdQc9q', NOW(), NOW(), 'eas123@123.com', false),
('south', 'sou', 'sou123', '$2a$12$S8vO5lapyxXiUUVk2e5WXeQQCyugjUo5J9DWD9mTmfefkbQSdQc9q', NOW(), NOW(), 'sou123@123.com', false),
('center', 'cen', 'cen123', '$2a$12$S8vO5lapyxXiUUVk2e5WXeQQCyugjUo5J9DWD9mTmfefkbQSdQc9q', NOW(), NOW(), 'cen123@123.com', false);

INSERT INTO addresses (user_id, address_1, address_2, city, state, zipcode)
VALUES
(1, '101 dolly', '', 'dalmation', 'MI', '01234'),
(2, '201 disney st', '', 'dalmation', 'MI', '01234'),
(3, '10201 storm blvd', '', 'dalmation', 'MI', '01234'),
(4, '2004 godville ave', '', 'dalmation', 'MI', '01234'),
(5, '690 richard st', '', 'dalmation', 'MI', '01234');

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
(5, 3, 'useless', 5);

INSERT INTO wishlist (user_id, product_id)
VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(2, 4),
(3, 4);