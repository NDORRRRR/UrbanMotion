-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.4.3 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for table urbanmotion_db.carts
CREATE TABLE IF NOT EXISTS `carts` (
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `size` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`product_id`,`size`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `carts_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table urbanmotion_db.carts: ~0 rows (approximately)

-- Dumping structure for table urbanmotion_db.forum_replies
CREATE TABLE IF NOT EXISTS `forum_replies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `thread_id` int NOT NULL,
  `user_id` int NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `thread_id` (`thread_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `forum_replies_ibfk_1` FOREIGN KEY (`thread_id`) REFERENCES `forum_threads` (`id`) ON DELETE CASCADE,
  CONSTRAINT `forum_replies_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table urbanmotion_db.forum_replies: ~0 rows (approximately)

-- Dumping structure for table urbanmotion_db.forum_threads
CREATE TABLE IF NOT EXISTS `forum_threads` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `category` enum('discussion','marketplace') NOT NULL DEFAULT 'discussion',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `contact_number` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_forum_threads_user` (`user_id`,`created_at`),
  CONSTRAINT `forum_threads_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table urbanmotion_db.forum_threads: ~0 rows (approximately)

-- Dumping structure for table urbanmotion_db.forum_thread_images
CREATE TABLE IF NOT EXISTS `forum_thread_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `thread_id` int NOT NULL,
  `image_url` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `thread_id` (`thread_id`),
  CONSTRAINT `forum_thread_images_ibfk_1` FOREIGN KEY (`thread_id`) REFERENCES `forum_threads` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table urbanmotion_db.forum_thread_images: ~0 rows (approximately)

-- Dumping structure for table urbanmotion_db.legit_checks
CREATE TABLE IF NOT EXISTS `legit_checks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `sneaker_name` varchar(255) NOT NULL,
  `status` enum('pending','in_review','completed') NOT NULL DEFAULT 'pending',
  `result` enum('verified','fake','inconclusive') DEFAULT NULL,
  `payment_status` enum('pending','paid','failed') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_legit_checks_status` (`status`,`created_at`),
  CONSTRAINT `legit_checks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table urbanmotion_db.legit_checks: ~0 rows (approximately)

-- Dumping structure for table urbanmotion_db.legit_check_images
CREATE TABLE IF NOT EXISTS `legit_check_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `legit_check_id` int NOT NULL,
  `image_url` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `legit_check_id` (`legit_check_id`),
  CONSTRAINT `legit_check_images_ibfk_1` FOREIGN KEY (`legit_check_id`) REFERENCES `legit_checks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table urbanmotion_db.legit_check_images: ~0 rows (approximately)

-- Dumping structure for table urbanmotion_db.orders
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `shipping_address` text,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_status` enum('pending','paid','failed') NOT NULL DEFAULT 'pending',
  `order_status` enum('new','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'new',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_orders_user_status` (`user_id`,`order_status`),
  KEY `idx_orders_payment` (`payment_status`,`created_at`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table urbanmotion_db.orders: ~1 rows (approximately)
INSERT INTO `orders` (`id`, `user_id`, `total_amount`, `shipping_address`, `payment_method`, `payment_status`, `order_status`, `created_at`) VALUES
	(6, 4, 1920000.00, 'Penerima: Adhim Musafak | HP: 082125608649 | Alamat: Griya Suci Permai G7/16', 'midtrans_snap', 'pending', 'shipped', '2025-12-18 08:28:16');

-- Dumping structure for table urbanmotion_db.order_items
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `seller_id` int NOT NULL,
  `quantity` int NOT NULL,
  `price_at_purchase` decimal(15,2) NOT NULL,
  `size` varchar(50) NOT NULL DEFAULT '',
  `tracking_number` varchar(100) DEFAULT NULL,
  `shipping_status` enum('pending','processing','shipped','delivered') DEFAULT 'pending',
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `idx_seller_shipping` (`seller_id`,`shipping_status`),
  KEY `idx_tracking` (`tracking_number`),
  KEY `idx_order_items_order` (`order_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `order_items_ibfk_3` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table urbanmotion_db.order_items: ~1 rows (approximately)
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `seller_id`, `quantity`, `price_at_purchase`, `size`, `tracking_number`, `shipping_status`) VALUES
	(6, 6, 4, 3, 2, 960000.00, 'All Size', 'JP-584925', 'delivered');

-- Dumping structure for table urbanmotion_db.products
CREATE TABLE IF NOT EXISTS `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `seller_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `brand` varchar(100) NOT NULL,
  `price` decimal(15,2) NOT NULL,
  `description` text,
  `stock` int DEFAULT '1',
  `sizes` varchar(255) DEFAULT 'All Size',
  `category` varchar(100) DEFAULT 'Sneakers',
  `condition_status` enum('New','Used') DEFAULT 'New',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_products_brand` (`brand`),
  KEY `idx_products_seller` (`seller_id`,`created_at`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table urbanmotion_db.products: ~3 rows (approximately)
INSERT INTO `products` (`id`, `seller_id`, `name`, `brand`, `price`, `description`, `stock`, `sizes`, `category`, `condition_status`, `created_at`, `is_deleted`) VALUES
	(3, 3, 'Skate Authentic in Red', 'Other', 550000.00, 'Skate low top shoe\r\n10 oz canvas upper for a durable and classic look\r\nAs seen in Tony Hawk’s™ Pro Skater™ 3 + 4\r\nUnpadded, low-profile cuff for a minimalist fit\r\nMetal eyelets. Four on sizes 3.5 - 6 and five on sizes 6.5+\r\nLace-up closure for a secure and customizable fit\r\nInternal tongue straps secure the tongue, preventing it from sliding during movement\r\nA molded heel counter provides structure support, improving stability and fit\r\nPopCush™ footbeds offer impact protection and reduce leg fatigue for extended skating\r\nDuraCap™ is a thin rubber underlay designed specifically for skateboarding, placed in key areas to protect against griptape wear\r\nHigher sidewalls for increased shoe protection and durability\r\nSickStick™ rubber—our stickiest yet—keeps you glued to your board\r\nSignature waffle sole pattern outsole for reliable grip since \'66\r\nVulcanized sole for superior board feel and flexibility', 5, 'All Size', 'Sneakers', 'New', '2025-12-17 19:56:06', 0),
	(4, 3, 'Skate Authentic Shoe', 'Other', 960000.00, 'Details\r\nSkate low top shoe\r\nDesigned for skateboarding with enhanced durability and performance features\r\n10 oz canvas upper for a durable and classic look\r\nUnpadded, low-profile cuff for a minimalist fit\r\nMetal eyelets. Four on sizes 3.5 - 6 and five on sizes 6.5+\r\nLace-up closure for a secure and customizable fit\r\nInternal tongue straps secure the tongue, preventing it from sliding during movement\r\nA molded heel counter provides structure support, improving stability and fit\r\nPopCush™ footbeds offer impact protection and reduce leg fatigue for extended skating\r\nDURACAP™ underlays add reinforcement to high-wear areas\r\nHigher sidewalls for increased shoe protection and durability\r\nSickStick™ rubber waffle outsole provides maximum grip and traction on your board\r\nSignature waffle sole pattern outsole for reliable grip since \'66\r\nVulcanized sole for superior board feel and flexibility', 8, 'All Size', 'Sneakers', 'New', '2025-12-17 20:05:08', 0),
	(5, 4, 'Adidas Bali Shoes', 'Adidas', 2200000.00, 'Part of the iconic island series, the adidas Bali shoes bring you back to when they debuted in 1977 and were made in France. Slip into the premium suede upper and escape into comfort. Their authentic design evokes carefree explorations, while a textile lining and rubber outsole provide all-day ease. For laid-back adventures with no-fuss style, lace up a piece of paradise.', 10, 'All Size', 'Sneakers', 'New', '2025-12-17 20:42:15', 0),
	(6, 4, 'Adistar Control 5 Shoes', 'Adidas', 1900000.00, 'Sepatu Adistar Control 5 hadir kembali, menghadirkan siluet lari ikonis tahun 2000-an ke jalanan dengan sentuhan segar. Dirancang untuk dipakai bergaya hidup, sepatu ini memadukan kenyamanan dan gaya dengan mudah.\r\n\r\nUpper berbahan open mesh memberikan sirkulasi udara, sementara overlay metalik menambah kesan gaya. Penutup renda memberikan kesesuaian yang aman, membuat setiap langkah terasa percaya diri dan stabil. Dengan outsole karet, sepatu ini memberikan cengkeraman yang andal di berbagai permukaan, menjadikannya pilihan yang kuat untuk petualangan di kota.\r\n\r\nRaih optimisme pemberontak dari adidas Originals. Baik saat Anda menjelajahi kota atau menikmati hari santai, ini adalah sepatu pilihan Anda untuk kenyamanan dan gaya. Rasakan perpaduan masa lalu dan masa kini dengan desain yang sesuai dengan gaya hidup unik Anda.', 1, '37, 38, 39, 40, 41, 42, 43, 44', 'Sneakers', 'New', '2025-12-18 04:24:07', 0),
	(7, 4, 'Y-3 Tokyo', 'Adidas', 5000000.00, 'Warna produk: Mystery Brown / Mystery Brown / Black\r\nKode produk: JS2463', 1, '37, 38, 39, 40, 41, 42, 43, 44', 'Sneakers', 'New', '2025-12-18 07:55:01', 0);

-- Dumping structure for table urbanmotion_db.product_images
CREATE TABLE IF NOT EXISTS `product_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `image_url` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table urbanmotion_db.product_images: ~24 rows (approximately)
INSERT INTO `product_images` (`id`, `product_id`, `image_url`) VALUES
	(7, 3, 'http://localhost:3001/uploads/product-1766001366497-837667636.jpg'),
	(8, 3, 'http://localhost:3001/uploads/product-1766001366501-989525981.jpg'),
	(9, 3, 'http://localhost:3001/uploads/product-1766001366505-813737748.jpg'),
	(10, 3, 'http://localhost:3001/uploads/product-1766001366507-245483765.jpg'),
	(11, 3, 'http://localhost:3001/uploads/product-1766001366509-480055640.jpg'),
	(12, 4, 'http://localhost:3001/uploads/product-1766001908451-111237090.png'),
	(13, 4, 'http://localhost:3001/uploads/product-1766001908452-528124080.png'),
	(14, 4, 'http://localhost:3001/uploads/product-1766001908453-371857377.png'),
	(15, 4, 'http://localhost:3001/uploads/product-1766001908453-875237133.png'),
	(16, 4, 'http://localhost:3001/uploads/product-1766001908464-369355903.png'),
	(17, 5, 'http://localhost:3001/uploads/product-1766004135420-186214395.png'),
	(18, 5, 'http://localhost:3001/uploads/product-1766004135421-564350233.png'),
	(19, 5, 'http://localhost:3001/uploads/product-1766004135421-746966243.png'),
	(20, 5, 'http://localhost:3001/uploads/product-1766004135422-194932713.png'),
	(21, 5, 'http://localhost:3001/uploads/product-1766004135424-716360715.png'),
	(22, 6, 'http://localhost:3001/uploads/images-1766031846951-190510626.avif'),
	(23, 6, 'http://localhost:3001/uploads/images-1766031846952-460190327.avif'),
	(24, 6, 'http://localhost:3001/uploads/images-1766031846963-763241592.avif'),
	(25, 6, 'http://localhost:3001/uploads/images-1766031846968-134119461.avif'),
	(26, 6, 'http://localhost:3001/uploads/images-1766031846972-507519767.avif'),
	(27, 7, 'https://res.cloudinary.com/dzapknsu0/image/upload/v1766044499/urban-motion-products/t1-1766044496448.avif'),
	(28, 7, 'https://res.cloudinary.com/dzapknsu0/image/upload/v1766044499/urban-motion-products/t2-1766044496449.avif'),
	(29, 7, 'https://res.cloudinary.com/dzapknsu0/image/upload/v1766044499/urban-motion-products/t3-1766044496547.avif'),
	(30, 7, 'https://res.cloudinary.com/dzapknsu0/image/upload/v1766044499/urban-motion-products/t4-1766044496554.avif'),
	(31, 7, 'https://res.cloudinary.com/dzapknsu0/image/upload/v1766044500/urban-motion-products/t5-1766044498369.avif');

-- Dumping structure for table urbanmotion_db.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `full_name` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `profile_picture` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table urbanmotion_db.users: ~4 rows (approximately)
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `role`, `created_at`, `full_name`, `phone`, `address`, `profile_picture`) VALUES
	(1, 'mandor', 'adhimreko@gmail.com', '$2b$10$SvbHOVkmoXC3LskSPmdV1OhJ4YRKOGRFSxobQnkP9Db5PdSBy8j7S', 'admin', '2025-11-18 03:30:53', NULL, '082125608649', NULL, NULL),
	(2, 'ndor', 'adhimreko1@gmail.com', '$2b$10$OMLhg/HgVjPK4SVHTqsb4OZ9fSlubXQMYwmzf30s5xecDyafgDOma', 'user', '2025-11-19 05:52:44', 'Adhim Musafak', '082125608649', 'Griya Suci Permai G7/16', NULL),
	(3, 'vans_indonesia', 'fadhim@gmail.com', '$2b$10$27.WpKxlgvk4.q0S7rPm4OmhIKfFFGx9LIstzQehjX2AGAW5VWtou', 'admin', '2025-12-17 15:01:26', NULL, NULL, NULL, NULL),
	(4, 'Adidas_Indonesia', 'adidas@gmail.com', '$2b$10$PyYJ9EOdEtzI2xuy5WHaYu/OCEeVstCpQBKGdzWfQWbcMBce06zS6', 'admin', '2025-12-17 20:12:03', NULL, '', NULL, 'https://res.cloudinary.com/dzapknsu0/image/upload/v1766045132/urban-motion-uploads/download-1766045130489.png');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
