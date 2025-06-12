-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 12 Jun 2025 pada 07.51
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ecommerce_db`
--

DELIMITER $$
--
-- Prosedur
--
CREATE DEFINER=`` PROCEDURE `CleanupExpiredCartItems` ()   BEGIN
    DELETE FROM cart_items 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
    
    SELECT ROW_COUNT() as deleted_items;
END$$

CREATE DEFINER=`` PROCEDURE `GetMonthlySalesReport` (IN `report_year` INT, IN `report_month` INT)   BEGIN
    SELECT 
        DATE(t.tanggal_transaksi) as sale_date,
        COUNT(t.id_transaksi) as transaction_count,
        SUM(t.total_harga) as daily_revenue,
        AVG(t.total_harga) as average_order_value
    FROM transactions t
    WHERE YEAR(t.tanggal_transaksi) = report_year 
    AND MONTH(t.tanggal_transaksi) = report_month
    AND t.status_pembayaran = 'completed'
    GROUP BY DATE(t.tanggal_transaksi)
    ORDER BY sale_date;
END$$

CREATE DEFINER=`` PROCEDURE `GetTopSellingProducts` (IN `limit_count` INT)   BEGIN
    SELECT 
        p.id_product,
        p.nama_product,
        p.harga,
        p.stock,
        SUM(ti.jumlah) as total_sold,
        SUM(ti.sub_total) as total_revenue,
        COUNT(DISTINCT ti.id_transaksi) as order_count
    FROM products p
    JOIN transaction_items ti ON p.id_product = ti.id_product
    JOIN transactions t ON ti.id_transaksi = t.id_transaksi
    WHERE t.status_pembayaran = 'completed'
    GROUP BY p.id_product, p.nama_product, p.harga, p.stock
    ORDER BY total_sold DESC
    LIMIT limit_count;
END$$

CREATE DEFINER=`` PROCEDURE `UpdateProductStock` (IN `product_id` INT, IN `stock_change` INT, IN `operation` VARCHAR(10))   BEGIN
    DECLARE current_stock INT;
    DECLARE new_stock INT;
    
    -- Get current stock
    SELECT stock INTO current_stock 
    FROM products 
    WHERE id_product = product_id;
    
    -- Calculate new stock based on operation
    CASE operation
        WHEN 'add' THEN SET new_stock = current_stock + stock_change;
        WHEN 'subtract' THEN SET new_stock = GREATEST(0, current_stock - stock_change);
        WHEN 'set' THEN SET new_stock = stock_change;
        ELSE SET new_stock = current_stock;
    END CASE;
    
    -- Update stock
    UPDATE products 
    SET stock = new_stock 
    WHERE id_product = product_id;
    
    -- Return result
    SELECT 
        product_id,
        current_stock as previous_stock,
        new_stock,
        operation;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Struktur dari tabel `cart_items`
--

CREATE TABLE `cart_items` (
  `id_cart` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `id_product` int(11) NOT NULL,
  `jumlah` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `cart_items`
--

INSERT INTO `cart_items` (`id_cart`, `id_user`, `id_product`, `jumlah`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 8, '2025-06-08 09:16:54', '2025-06-12 05:45:38'),
(2, 2, 1, 1, '2025-06-09 23:35:54', '2025-06-09 23:35:54');

--
-- Trigger `cart_items`
--
DELIMITER $$
CREATE TRIGGER `cart_items_updated_at` BEFORE UPDATE ON `cart_items` FOR EACH ROW BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Stand-in struktur untuk tampilan `cart_summary`
-- (Lihat di bawah untuk tampilan aktual)
--
CREATE TABLE `cart_summary` (
`id_user` int(11)
,`nama` varchar(100)
,`email` varchar(100)
,`items_in_cart` bigint(21)
,`total_quantity` decimal(32,0)
,`cart_value` decimal(42,2)
);

-- --------------------------------------------------------

--
-- Struktur dari tabel `documents`
--

CREATE TABLE `documents` (
  `id_dokumen` int(11) NOT NULL,
  `id_transaksi` int(11) NOT NULL,
  `tipe_dokumen` varchar(50) NOT NULL,
  `tanggal_pembuatan` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `products`
--

CREATE TABLE `products` (
  `id_product` int(11) NOT NULL,
  `nama_product` varchar(100) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `harga` decimal(10,2) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `products`
--

INSERT INTO `products` (`id_product`, `nama_product`, `deskripsi`, `harga`, `stock`, `created_at`, `updated_at`) VALUES
(1, 'Laptop HP Pavilion', 'Laptop HP Pavilion 14 inch dengan processor Intel Core i5', 8500000.00, 10, '2025-06-07 12:02:13', '2025-06-07 12:02:13'),
(2, 'Mouse Wireless Logitech', 'Mouse wireless Logitech dengan teknologi laser', 250000.00, 50, '2025-06-07 12:02:13', '2025-06-07 12:02:13'),
(3, 'Keyboard Mechanical', 'Keyboard mechanical dengan switch Cherry MX Blue', 1200000.00, 25, '2025-06-07 12:02:13', '2025-06-07 12:02:13'),
(4, 'Monitor LED 24 inch', 'Monitor LED 24 inch Full HD dengan resolusi 1920x1080', 2500000.00, 15, '2025-06-07 12:02:13', '2025-06-07 12:02:13'),
(5, 'Headset Gaming', 'Headset gaming dengan surround sound 7.1', 800000.00, 30, '2025-06-07 12:02:13', '2025-06-07 12:02:13'),
(6, 'Webcam HD', 'Webcam HD 1080p untuk video call dan streaming', 450000.00, 20, '2025-06-07 12:02:13', '2025-06-07 12:02:13'),
(7, 'SSD 500GB', 'SSD SATA 500GB dengan kecepatan baca 560 MB/s', 850000.00, 40, '2025-06-07 12:02:13', '2025-06-07 12:02:13'),
(8, 'RAM DDR4 8GB', 'RAM DDR4 8GB PC-2400 untuk upgrade laptop/PC', 600000.00, 35, '2025-06-07 12:02:13', '2025-06-07 12:02:13'),
(9, 'Printer Inkjet Canon', 'Printer inkjet Canon dengan fitur scan dan copy', 1800000.00, 12, '2025-06-07 12:02:13', '2025-06-07 12:02:13'),
(10, 'External HDD 1TB', 'External hard disk 1TB USB 3.0 portable', 750000.00, 25, '2025-06-07 12:02:13', '2025-06-07 12:02:13');

--
-- Trigger `products`
--
DELIMITER $$
CREATE TRIGGER `products_updated_at` BEFORE UPDATE ON `products` FOR EACH ROW BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Stand-in struktur untuk tampilan `product_sales_summary`
-- (Lihat di bawah untuk tampilan aktual)
--
CREATE TABLE `product_sales_summary` (
`id_product` int(11)
,`nama_product` varchar(100)
,`harga` decimal(10,2)
,`stock` int(11)
,`total_sold` decimal(32,0)
,`total_revenue` decimal(32,2)
,`transaction_count` bigint(21)
);

-- --------------------------------------------------------

--
-- Struktur dari tabel `transactions`
--

CREATE TABLE `transactions` (
  `id_transaksi` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `total_harga` decimal(10,2) NOT NULL,
  `tanggal_transaksi` timestamp NOT NULL DEFAULT current_timestamp(),
  `metode_pembayaran` varchar(50) NOT NULL,
  `status_pembayaran` enum('pending','completed','failed') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Trigger `transactions`
--
DELIMITER $$
CREATE TRIGGER `transactions_updated_at` BEFORE UPDATE ON `transactions` FOR EACH ROW BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Stand-in struktur untuk tampilan `transaction_details`
-- (Lihat di bawah untuk tampilan aktual)
--
CREATE TABLE `transaction_details` (
`id_transaksi` int(11)
,`id_user` int(11)
,`user_nama` varchar(100)
,`user_email` varchar(100)
,`total_harga` decimal(10,2)
,`tanggal_transaksi` timestamp
,`metode_pembayaran` varchar(50)
,`status_pembayaran` enum('pending','completed','failed')
,`items_count` bigint(21)
,`product_names` mediumtext
);

-- --------------------------------------------------------

--
-- Struktur dari tabel `transaction_items`
--

CREATE TABLE `transaction_items` (
  `id_transaksi_item` int(11) NOT NULL,
  `id_transaksi` int(11) NOT NULL,
  `id_product` int(11) NOT NULL,
  `jumlah` int(11) NOT NULL,
  `sub_total` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id_user` int(11) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `pass` varchar(255) NOT NULL,
  `role` enum('admin','employee') DEFAULT 'employee',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id_user`, `nama`, `email`, `pass`, `role`, `created_at`, `updated_at`) VALUES
(1, 'Administrator', 'admin@ecommerce.com', '$2a$12$JfzZIU48Dk7mJzUIh769q.1s2Jbh029h8hmLexiz5wWGjLV1H.xf2', 'admin', '2025-06-07 12:02:12', '2025-06-08 08:23:33'),
(2, 'John Employee', 'employee@ecommerce.com', '$2a$12$ws6s921zu4KDBEvftf02CeJ9YSmJocl3krWu2E5J.8doxsfkCwmX6', 'employee', '2025-06-07 12:02:12', '2025-06-08 08:23:33');

--
-- Trigger `users`
--
DELIMITER $$
CREATE TRIGGER `users_updated_at` BEFORE UPDATE ON `users` FOR EACH ROW BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Stand-in struktur untuk tampilan `user_transaction_summary`
-- (Lihat di bawah untuk tampilan aktual)
--
CREATE TABLE `user_transaction_summary` (
`id_user` int(11)
,`nama` varchar(100)
,`email` varchar(100)
,`role` enum('admin','employee')
,`total_transactions` bigint(21)
,`total_spent` decimal(32,2)
,`average_order_value` decimal(14,6)
,`last_transaction_date` timestamp
);

-- --------------------------------------------------------

--
-- Struktur untuk view `cart_summary`
--
DROP TABLE IF EXISTS `cart_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`` SQL SECURITY DEFINER VIEW `cart_summary`  AS SELECT `u`.`id_user` AS `id_user`, `u`.`nama` AS `nama`, `u`.`email` AS `email`, count(`ci`.`id_cart`) AS `items_in_cart`, coalesce(sum(`ci`.`jumlah`),0) AS `total_quantity`, coalesce(sum(`ci`.`jumlah` * `p`.`harga`),0) AS `cart_value` FROM ((`users` `u` left join `cart_items` `ci` on(`u`.`id_user` = `ci`.`id_user`)) left join `products` `p` on(`ci`.`id_product` = `p`.`id_product`)) GROUP BY `u`.`id_user`, `u`.`nama`, `u`.`email` ;

-- --------------------------------------------------------

--
-- Struktur untuk view `product_sales_summary`
--
DROP TABLE IF EXISTS `product_sales_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`` SQL SECURITY DEFINER VIEW `product_sales_summary`  AS SELECT `p`.`id_product` AS `id_product`, `p`.`nama_product` AS `nama_product`, `p`.`harga` AS `harga`, `p`.`stock` AS `stock`, coalesce(sum(`ti`.`jumlah`),0) AS `total_sold`, coalesce(sum(`ti`.`sub_total`),0) AS `total_revenue`, count(distinct `ti`.`id_transaksi`) AS `transaction_count` FROM ((`products` `p` left join `transaction_items` `ti` on(`p`.`id_product` = `ti`.`id_product`)) left join `transactions` `t` on(`ti`.`id_transaksi` = `t`.`id_transaksi` and `t`.`status_pembayaran` = 'completed')) GROUP BY `p`.`id_product`, `p`.`nama_product`, `p`.`harga`, `p`.`stock` ;

-- --------------------------------------------------------

--
-- Struktur untuk view `transaction_details`
--
DROP TABLE IF EXISTS `transaction_details`;

CREATE ALGORITHM=UNDEFINED DEFINER=`` SQL SECURITY DEFINER VIEW `transaction_details`  AS SELECT `t`.`id_transaksi` AS `id_transaksi`, `t`.`id_user` AS `id_user`, `u`.`nama` AS `user_nama`, `u`.`email` AS `user_email`, `t`.`total_harga` AS `total_harga`, `t`.`tanggal_transaksi` AS `tanggal_transaksi`, `t`.`metode_pembayaran` AS `metode_pembayaran`, `t`.`status_pembayaran` AS `status_pembayaran`, count(`ti`.`id_transaksi_item`) AS `items_count`, group_concat(`p`.`nama_product` separator ', ') AS `product_names` FROM (((`transactions` `t` join `users` `u` on(`t`.`id_user` = `u`.`id_user`)) left join `transaction_items` `ti` on(`t`.`id_transaksi` = `ti`.`id_transaksi`)) left join `products` `p` on(`ti`.`id_product` = `p`.`id_product`)) GROUP BY `t`.`id_transaksi`, `t`.`id_user`, `u`.`nama`, `u`.`email`, `t`.`total_harga`, `t`.`tanggal_transaksi`, `t`.`metode_pembayaran`, `t`.`status_pembayaran` ;

-- --------------------------------------------------------

--
-- Struktur untuk view `user_transaction_summary`
--
DROP TABLE IF EXISTS `user_transaction_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`` SQL SECURITY DEFINER VIEW `user_transaction_summary`  AS SELECT `u`.`id_user` AS `id_user`, `u`.`nama` AS `nama`, `u`.`email` AS `email`, `u`.`role` AS `role`, count(`t`.`id_transaksi`) AS `total_transactions`, coalesce(sum(`t`.`total_harga`),0) AS `total_spent`, coalesce(avg(`t`.`total_harga`),0) AS `average_order_value`, max(`t`.`tanggal_transaksi`) AS `last_transaction_date` FROM (`users` `u` left join `transactions` `t` on(`u`.`id_user` = `t`.`id_user` and `t`.`status_pembayaran` = 'completed')) GROUP BY `u`.`id_user`, `u`.`nama`, `u`.`email`, `u`.`role` ;

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id_cart`),
  ADD UNIQUE KEY `unique_user_product` (`id_user`,`id_product`),
  ADD KEY `idx_user` (`id_user`),
  ADD KEY `idx_product` (`id_product`);

--
-- Indeks untuk tabel `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id_dokumen`),
  ADD KEY `idx_transaksi` (`id_transaksi`),
  ADD KEY `idx_tipe` (`tipe_dokumen`),
  ADD KEY `idx_tanggal` (`tanggal_pembuatan`),
  ADD KEY `idx_documents_transaction_type` (`id_transaksi`,`tipe_dokumen`);

--
-- Indeks untuk tabel `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id_product`),
  ADD KEY `idx_nama_product` (`nama_product`),
  ADD KEY `idx_stock` (`stock`),
  ADD KEY `idx_harga` (`harga`),
  ADD KEY `idx_products_stock_harga` (`stock`,`harga`);
ALTER TABLE `products` ADD FULLTEXT KEY `nama_product` (`nama_product`,`deskripsi`);

--
-- Indeks untuk tabel `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id_transaksi`),
  ADD KEY `idx_user` (`id_user`),
  ADD KEY `idx_status` (`status_pembayaran`),
  ADD KEY `idx_tanggal` (`tanggal_transaksi`),
  ADD KEY `idx_total` (`total_harga`),
  ADD KEY `idx_transactions_user_status` (`id_user`,`status_pembayaran`),
  ADD KEY `idx_transactions_date_status` (`tanggal_transaksi`,`status_pembayaran`);

--
-- Indeks untuk tabel `transaction_items`
--
ALTER TABLE `transaction_items`
  ADD PRIMARY KEY (`id_transaksi_item`),
  ADD KEY `idx_transaksi` (`id_transaksi`),
  ADD KEY `idx_product` (`id_product`),
  ADD KEY `idx_transaction_items_transaction_product` (`id_transaksi`,`id_product`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_users_email_role` (`email`,`role`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id_cart` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `documents`
--
ALTER TABLE `documents`
  MODIFY `id_dokumen` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `products`
--
ALTER TABLE `products`
  MODIFY `id_product` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT untuk tabel `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id_transaksi` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `transaction_items`
--
ALTER TABLE `transaction_items`
  MODIFY `id_transaksi_item` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`id_product`) REFERENCES `products` (`id_product`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`id_transaksi`) REFERENCES `transactions` (`id_transaksi`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `transaction_items`
--
ALTER TABLE `transaction_items`
  ADD CONSTRAINT `transaction_items_ibfk_1` FOREIGN KEY (`id_transaksi`) REFERENCES `transactions` (`id_transaksi`) ON DELETE CASCADE,
  ADD CONSTRAINT `transaction_items_ibfk_2` FOREIGN KEY (`id_product`) REFERENCES `products` (`id_product`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
