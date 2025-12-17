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

-- Dumping data for table urbanmotion_db.carts: ~2 rows (approximately)

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
INSERT INTO `forum_replies` (`id`, `thread_id`, `user_id`, `content`, `created_at`) VALUES
	(1, 3, 2, 'anjay\n', '2025-11-26 06:13:31');

-- Dumping structure for table urbanmotion_db.forum_threads
CREATE TABLE IF NOT EXISTS `forum_threads` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `category` enum('discussion','marketplace') NOT NULL DEFAULT 'discussion',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `forum_threads_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table urbanmotion_db.forum_threads: ~1 rows (approximately)
INSERT INTO `forum_threads` (`id`, `user_id`, `title`, `content`, `category`, `created_at`) VALUES
	(3, 2, 'asdasdasd', 'asdasdasd', 'discussion', '2025-11-26 06:13:24');

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
  CONSTRAINT `legit_checks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table urbanmotion_db.legit_checks: ~1 rows (approximately)

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
  KEY `user_id` (`user_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table urbanmotion_db.orders: ~1 rows (approximately)
INSERT INTO `orders` (`id`, `user_id`, `total_amount`, `shipping_address`, `payment_method`, `payment_status`, `order_status`, `created_at`) VALUES
	(1, 2, 999000.00, 'Penerima: Adhim Musafak | HP: 082125608649 | Alamat: Griya Suci Permai G7/16', 'midtrans_snap', 'paid', 'shipped', '2025-11-25 22:35:46'),
	(2, 2, 2997000.00, 'Penerima: Adhim Musafak | HP: 082125608649 | Alamat: Griya Suci Permai G7/16', 'midtrans_snap', 'pending', 'new', '2025-12-17 00:42:42'),
	(3, 2, 2997000.00, 'Penerima: Adhim Musafak | HP: 082125608649 | Alamat: Griya Suci Permai G7/16', 'midtrans_snap', 'pending', 'new', '2025-12-17 00:43:23'),
	(4, 2, 2997000.00, 'Penerima: Adhim Musafak | HP: 082125608649 | Alamat: Griya Suci Permai G7/16', 'midtrans_snap', 'pending', 'new', '2025-12-17 00:43:23'),
	(5, 2, 2997000.00, 'Penerima: Adhim Musafak | HP: 082125608649 | Alamat: Griya Suci Permai G7/16', 'midtrans_snap', 'pending', 'new', '2025-12-17 00:43:35');

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
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  KEY `idx_seller_shipping` (`seller_id`,`shipping_status`),
  KEY `idx_tracking` (`tracking_number`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `order_items_ibfk_3` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table urbanmotion_db.order_items: ~2 rows (approximately)
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `seller_id`, `quantity`, `price_at_purchase`, `size`, `tracking_number`, `shipping_status`) VALUES
	(1, 1, 2, 1, 1, 999000.00, '', NULL, 'delivered'),
	(2, 2, 2, 1, 3, 999000.00, '40', NULL, 'processing');

-- Dumping structure for table urbanmotion_db.products
CREATE TABLE IF NOT EXISTS `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `seller_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `brand` varchar(100) NOT NULL,
  `price` decimal(15,2) NOT NULL,
  `description` text,
  `stock` int DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `sizes` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `seller_id` (`seller_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table urbanmotion_db.products: ~1 rows (approximately)
INSERT INTO `products` (`id`, `seller_id`, `name`, `brand`, `price`, `description`, `stock`, `created_at`, `sizes`) VALUES
	(2, 1, 'Skate Authentic in Red', 'Vans', 999000.00, 'Style VN0A2Z2ZRED\r\n\r\nCompletely redesigned for modern skateboarding, the Skate Classics collection delivers more of what skateboarders need to enable maximum progression. A vulcanized shoe made with classic canvas uppers that nod to our original heritage shoe, the Skate Authentic gives you the iconic look you want while bringing all the performance benefits skateboarders demand. A wardrobe staple of the skateboarding community for decades, these Skate Authentics were featured in Tony Hawk’s Pro Skater 3 + 4, cementing their place in skateboarding forever.', 10, '2025-11-18 17:06:22', '39, 40, 41, 42, 43, 44');

-- Dumping structure for table urbanmotion_db.product_images
CREATE TABLE IF NOT EXISTS `product_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `image_url` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table urbanmotion_db.product_images: ~6 rows (approximately)
INSERT INTO `product_images` (`id`, `product_id`, `image_url`) VALUES
	(1, 2, 'http://localhost:3001/uploads/legit-1763485582224-413886730.jpg'),
	(2, 2, 'http://localhost:3001/uploads/legit-1763485582226-498827620.jpg'),
	(3, 2, 'http://localhost:3001/uploads/legit-1763485582227-567113820.jpg'),
	(4, 2, 'http://localhost:3001/uploads/legit-1763485582228-75418829.jpg'),
	(5, 2, 'http://localhost:3001/uploads/legit-1763485582231-360442980.jpg'),
	(6, 2, 'http://localhost:3001/uploads/legit-1763485582239-476945187.jpg');

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
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table urbanmotion_db.users: ~2 rows (approximately)
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `role`, `created_at`, `full_name`, `phone`, `address`) VALUES
	(1, 'mandor', 'adhimreko@gmail.com', '$2b$10$SvbHOVkmoXC3LskSPmdV1OhJ4YRKOGRFSxobQnkP9Db5PdSBy8j7S', 'admin', '2025-11-18 03:30:53', NULL, '082125608649', NULL),
	(2, 'ndor', 'adhimreko1@gmail.com', '$2b$10$OMLhg/HgVjPK4SVHTqsb4OZ9fSlubXQMYwmzf30s5xecDyafgDOma', 'user', '2025-11-19 05:52:44', 'Adhim Musafak', '082125608649', 'Griya Suci Permai G7/16');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
