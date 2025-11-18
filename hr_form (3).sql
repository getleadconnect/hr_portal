-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 01, 2025 at 01:39 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hr_form`
--

-- --------------------------------------------------------

--
-- Table structure for table `applications`
--

CREATE TABLE `applications` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `photo` varchar(500) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `technology_stack` varchar(200) DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `marital_status` varchar(50) DEFAULT NULL,
  `father_name` varchar(100) DEFAULT NULL,
  `address` varchar(1000) DEFAULT NULL,
  `pincode` int(10) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `countrycode` int(11) DEFAULT NULL,
  `mobile` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `experience` varchar(20) DEFAULT NULL,
  `experience_years` int(11) DEFAULT NULL,
  `previous_employer` varchar(200) DEFAULT NULL,
  `last_drawn_salary` int(11) DEFAULT NULL,
  `expected_salary` int(11) DEFAULT NULL,
  `why_changing_job` text DEFAULT NULL,
  `why_getlead` text DEFAULT NULL,
  `qualification` varchar(200) DEFAULT NULL,
  `cv_file` varchar(500) DEFAULT NULL,
  `job_category_id` int(11) DEFAULT NULL,
  `declaration` text DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `applications`
--

INSERT INTO `applications` (`id`, `name`, `photo`, `dob`, `technology_stack`, `gender`, `marital_status`, `father_name`, `address`, `pincode`, `state`, `district`, `countrycode`, `mobile`, `email`, `experience`, `experience_years`, `previous_employer`, `last_drawn_salary`, `expected_salary`, `why_changing_job`, `why_getlead`, `qualification`, `cv_file`, `job_category_id`, `declaration`, `deleted_at`, `created_at`, `updated_at`) VALUES
(1, 'sdffsdff', 'user_files/181734950741.jpg', '2024-12-18', 'sdfdfdfdsfdf', 'Male', 'Single', 'fsdfdfds', 'dfsfsdf', 243245, 'fsdfsfsdf', 'sdfsdfsdfsdf', 91, '2344234423', 'ww@gmail.com', 'Yes', NULL, 'adadad', 20000, 321323, NULL, 'fdgfdgdfgdfg', 'fsdfdfsdfsdf', 'user_files/511734950741.jpg', NULL, 'gdfgdgsggdf dfgfdggfd g', NULL, '2024-12-23 10:45:41', '2024-12-23 10:45:41'),
(2, 'dsfdfsf', 'user_files/521735028821.jpg', '2024-12-18', 'asdaadsa', 'Male', 'Single', 'asdasd', 'sadasdsa', 233232, 'dasdadsa', 'dasdasdsa', NULL, '42344234', 'me@webos.com', 'Yes', NULL, 'asdsadsadasd', 20000, 30000, NULL, 'dsaddad', 'dsadsadasdas', 'user_files/181735028821.pdf', NULL, NULL, NULL, '2024-12-24 08:27:01', '2024-12-24 08:27:01'),
(6, 'shaji-test-1111', 'user_files/941735035934.jpg', '2024-11-01', 'this is stesting', 'Male', 'Married', 'yyyyyyyyyyyy', 'nnnnnnnnnnnnnnnn', 123456, 'kerala', 'kozhikode', 91, '9995331111', 'shajigetlead@gmail.com', 'Yes', NULL, 'getlead', 20000, 30000, NULL, 'nothing', 'mba', 'user_files/451735035934.pdf', NULL, NULL, NULL, '2024-12-24 10:25:34', '2024-12-24 10:25:34'),
(7, 'shaji-12345', 'user_files/231735036187.jpg', '2024-12-11', 'bcvbcb,fsfsdf,fsdfsfsdf', 'Male', 'Married', 'wwwwwwww', 'fdsfdfdfdsfsdfsd', 123456, 'kerala', 'kozhikode', 91, '9995112233', 'shaji1122@getlead.co.uk', 'Yes', NULL, 'getlead', 20000, 30000, NULL, 'nothing', 'mba', 'user_files/471735036187.pdf', NULL, NULL, NULL, '2024-12-24 10:29:47', '2024-12-24 10:29:47'),
(8, 'TEST', 'user_files/671735037325.jpg', '2024-12-02', 'FSDF F FFSFSDF, FFFFS ,FF SFSF', 'Male', 'Married', 'DSADASDAD', 'DSADSADSAD', 123456, 'kerala', 'kozhikode', 91, '7896541236', 'finance11@getlead.com', 'Yes', NULL, 'getlead', 20000, 30000, NULL, 'nothing', 'mba', 'user_files/431735037325.pdf', NULL, NULL, NULL, '2024-12-24 10:48:45', '2024-12-24 10:48:45'),
(9, 'Athira', 'user_files/551735037925.jpg', '2024-12-09', 'bde', 'Female', 'Married', 'Ravi', 'sfref', 123654, 'kerala', 'kozhikode', 91, '6282900762', 'me@webos.com', 'Yes', NULL, 'webqua', 45000, 5000, NULL, 'dgf', 'mba', 'user_files/961735037925.pdf', NULL, NULL, '2024-12-24 11:35:58', '2024-12-24 10:58:45', '2024-12-24 11:35:58'),
(10, 'Athira', 'user_files/681735037967.jpg', '2024-12-09', 'bde', 'Female', 'Married', 'Ravi', 'sfref', 123654, 'kerala', 'kozhikode', 91, '6282900762', 'me@webos.com', 'Yes', NULL, 'webqua', 45000, 5000, NULL, 'dgf', 'mba', 'user_files/101735037967.pdf', NULL, NULL, '2024-12-24 11:35:54', '2024-12-24 10:59:27', '2024-12-24 11:35:54'),
(11, 'testing', 'user_files/421735038224.jpg', '2024-12-19', 'ssss,vvvv,hhgghfhf', 'Male', 'Married', 'dddddddd', 'ffffffffffffffff', 123654, 'kerala', 'kozhikode', 91, '4563217892', 'shaji@gmail.com', 'Yes', NULL, 'getlead', 20000, 30000, NULL, 'nothing', 'mba', 'user_files/821735038224.pdf', NULL, NULL, NULL, '2024-12-24 11:03:44', '2024-12-24 11:03:44'),
(12, 'yyyyyyyyyyyyyyy', 'user_files/981735038553.jpg', '2024-12-25', 'fdsfdsfsdf, fdg gdg', 'Male', 'Single', 'dgfgdgfdgfdg', 'shop no : 5 street- 11 Karama, Dubai', 123654, 'kerala', 'kozhikode', 91, '9605136600', 'finance@getlead.com', 'Yes', NULL, 'getlead', 20000, 30000, NULL, 'nothing', 'mba', 'user_files/671735038553.pdf', NULL, NULL, '2024-12-24 11:35:48', '2024-12-24 11:09:13', '2024-12-24 11:35:48'),
(13, 'fsddsfsfdsf', 'user_files/991735038842.png', '2024-12-25', 'fsdff', 'Male', 'Married', 'fsdsffdsf', 'dsfdfdsfd', 433232, 'fsdfdfsdf', 'dsfsfsdfsdfds', 91, '9605136600', 'finance@getlead.com', 'Yes', NULL, 'getlead', 20000, 30000, NULL, 'nothing', 'mba', 'user_files/651735038842.pdf', NULL, NULL, '2024-12-24 11:35:44', '2024-12-24 11:14:02', '2024-12-24 11:35:44'),
(14, 'mmmmmm', 'user_files/841735038978.jpg', '2024-12-26', 'bbbbbbbbb', 'Male', 'Married', 'mmmmmmmmm', 'dddddddddddd', 123654, 'kerala', 'kozhikode', 91, '0521783758', 'shaji00@webqua.com', 'Yes', NULL, 'nil', 20000, 30000, NULL, 'nothing', 'mba', 'user_files/481735038978.pdf', NULL, NULL, '2024-12-24 11:35:40', '2024-12-24 11:16:18', '2024-12-24 11:35:40'),
(15, 'nnnnnnnnnn', 'user_files/781735039219.png', '2024-12-25', 'sdggdfgfdgfdg', 'Male', 'Married', 'gdfggfdgfdgf', 'gdfgfdgfdg', 444343, 'kerala', 'kozhikode', 91, '9995338385', 'shaji@getlead.co.uk', 'Yes', NULL, 'fsfsdfdsfdsf', 20000, 30000, NULL, 'nothing', 'mba', 'user_files/581735039219.pdf', NULL, NULL, '2024-12-24 11:35:36', '2024-12-24 11:20:19', '2024-12-24 11:35:36'),
(16, 'yyyyyyyy', 'user_files/131735039408.png', '2024-12-25', 'bbcvbbvcbvcbcvb', 'Male', 'Married', 'asdsadasd', 'dsadadasd', 123654, 'kerala', 'kozhikode', 91, '0521783758', 'finance@getlead.com', 'Yes', NULL, 'getlead', 20000, 30000, NULL, 'nothing', 'mba', 'user_files/421735039408.pdf', NULL, NULL, '2024-12-24 11:35:32', '2024-12-24 11:23:28', '2024-12-24 11:35:32'),
(17, 'bbbbbbbbbb', 'user_files/371735039536.png', '2024-12-17', 'saddaadasdsa', 'Male', 'Married', 'fsdff', 'shop no : 5 street- 11 Karama, Dubai', 123654, 'kerala', 'kozhikode', 91, '9995338385', 'shaji@getlead.co.uk', 'Yes', NULL, 'getlead', 20000, 30000, NULL, 'nothing', 'mba', 'user_files/371735039536.pdf', 5, NULL, NULL, '2024-12-24 11:25:37', '2024-12-24 11:25:37'),
(18, 'bbbbbbbbbbbb', 'user_files/851735039678.png', '2024-12-25', 'dsffsdfsdfdsfdsf', 'Male', 'Married', 'fdsfsdfd', 'shop no : 5 street- 11 Karama, Dubai', 123654, 'kerala', 'kozhikode', 91, '9605136123', 'shaji111111@webqua.com', 'Yes', NULL, 'getlead', 20000, 30000, NULL, 'nothing', 'mba', 'user_files/841735039678.pdf', 6, NULL, NULL, '2024-12-24 11:27:58', '2024-12-24 11:27:58'),
(19, 'vvvvvvv vvvvvvvv', 'user_files/421735039814.png', '2024-12-26', 'fdsfsdfd dfds fdfdsf', 'Male', 'Married', 'fsdff', 'shop no : 5 street- 11 Karama, Dubai', 123654, 'kerala', 'kozhikode', 91, '5567883234', 'shaji2233@webqua.com', 'Yes', NULL, 'getlead', 20000, 30000, NULL, 'nothing', 'mba', 'user_files/281735039814.pdf', 5, NULL, NULL, '2024-12-24 11:30:14', '2024-12-24 11:30:14'),
(20, 'yyyyyyyyyyy', 'user_files/661735549423.png', '2002-02-01', 'ss,ddd', 'Male', 'Married', 'dddsaddas', 'dasdadsadsad', 323233, 'kerala', 'kozhikode', 91, '6541239874', 'shaji12@getlead.co.uk', 'Yes', NULL, 'saddadas', 20000, 30000, NULL, 'nothing', 'mba', 'user_files/671735549423.pdf', 2, NULL, NULL, '2024-12-30 09:03:43', '2024-12-30 09:03:43'),
(21, 'yyyyyyyy yyyyyyyy', 'user_files/891735556606.png', '1997-02-08', 'dsasddsadasd', 'Male', 'Married', 'ddadasd', 'dasdasd', 323213, 'adddsad', 'dadasdsd', 91, '4324324434', 'sss@gmail.com', 'Yes', NULL, 'adadaddasda', 20000, 30000, NULL, 'dsadadad', 'ddasda', 'user_files/951735556606.pdf', 4, NULL, NULL, '2024-12-30 11:03:26', '2024-12-30 11:03:26');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `countries`
--

CREATE TABLE `countries` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(191) DEFAULT NULL,
  `country_code` varchar(191) DEFAULT NULL,
  `tax` int(11) DEFAULT NULL,
  `code` varchar(191) DEFAULT NULL,
  `currency` varchar(191) DEFAULT NULL,
  `currency_code` varchar(191) DEFAULT NULL,
  `flags` varchar(191) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `countries`
--

INSERT INTO `countries` (`id`, `name`, `country_code`, `tax`, `code`, `currency`, `currency_code`, `flags`, `deleted_at`, `created_at`, `updated_at`) VALUES
(1, 'UNITED ARAB EMIRATES', 'AE', NULL, '971', 'United Arab Emirates Dirham', 'AED', '/backend/images/flag-icons/ae.png', NULL, '2019-04-01 05:34:05', '2019-04-01 05:34:05'),
(2, 'AFGHANISTAN', 'AF', NULL, '93', 'Afghanistan Afghani', 'AFN', '/backend/images/flag-icons/af.png', NULL, '2019-04-01 05:34:05', '2019-04-01 05:34:05'),
(3, 'NETHERLANDS ANTILLES', 'AN', NULL, '599', 'Netherlands Antillean guilder', 'ANG', '/backend/images/flag-icons/am.png', NULL, '2019-04-01 05:34:05', '2019-04-01 05:34:05'),
(4, 'ARGENTINA', 'AR', NULL, '54', 'Argentine peso', 'ARS', '/backend/images/flag-icons/ar.png', NULL, '2019-04-01 05:34:05', '2019-04-01 05:34:05'),
(5, 'AUSTRIA', 'AT', NULL, '43', 'Euro', 'EUR', '/backend/images/flag-icons/at.png', NULL, '2019-04-01 05:34:05', '2019-04-01 05:34:05'),
(6, 'AUSTRALIA', 'AU', NULL, '61', 'Australian dollar', 'AUD', '/backend/images/flag-icons/au.png', NULL, '2019-04-01 05:34:05', '2019-04-01 05:34:05'),
(7, 'BANGLADESH', 'BD', NULL, '880', 'Bangladeshi taka', 'BDT', '/backend/images/flag-icons/bd.png', NULL, '2019-04-01 05:34:05', '2019-04-01 05:34:05'),
(8, 'BELGIUM', 'BE', NULL, '32', 'Euro', 'EUR', '/backend/images/flag-icons/be.png', NULL, '2019-04-01 05:34:05', '2019-04-01 05:34:05'),
(9, 'BAHRAIN', 'BH', NULL, '973', 'Bahraini dinar', 'BHD', '/backend/images/flag-icons/bh.png', NULL, '2019-04-01 05:34:05', '2019-04-01 05:34:05'),
(10, 'BRAZIL', 'BR', NULL, '55', 'Brazilian real', 'BRL', '/backend/images/flag-icons/br.png', NULL, '2019-04-01 05:34:05', '2019-04-01 05:34:05'),
(11, 'BHUTAN', 'BT', NULL, '975', 'Bhutanese ngultrum', 'BTN', '/backend/images/flag-icons/bt.png', NULL, '2019-04-01 05:34:06', '2019-04-01 05:34:06'),
(12, 'CANADA', 'CA', NULL, '1', 'Canadian dollar', 'CAD', '/backend/images/flag-icons/ca.png', NULL, '2019-04-01 05:34:06', '2019-04-01 05:34:06'),
(13, 'CONGO', 'CG', NULL, '242', 'Central African CFA franc', 'XAF', '/backend/images/flag-icons/cg.png', NULL, '2019-04-01 05:34:06', '2019-04-01 05:34:06'),
(14, 'SWITZERLAND', 'CH', NULL, '41', 'wiss franc', 'CHF', '/backend/images/flag-icons/ch.png', NULL, '2019-04-01 05:34:06', '2019-04-01 05:34:06'),
(15, 'CHILE', 'CL', NULL, '56', 'Chilean peso', 'CLP', '/backend/images/flag-icons/cl.png', NULL, '2019-04-01 05:34:06', '2019-04-01 05:34:06'),
(16, 'CHINA', 'CN', NULL, '86', 'Renminbi|Chinese yuan', 'CNY', '/backend/images/flag-icons/cn.png', NULL, '2019-04-01 05:34:06', '2019-04-01 05:34:06'),
(17, 'COLOMBIA', 'CO', NULL, '57', 'Colombian peso', 'COP', '/backend/images/flag-icons/co.png', NULL, '2019-04-01 05:34:06', '2019-04-01 05:34:06'),
(18, 'COSTA RICA', 'CR', NULL, '506', 'Costa Rican colon', 'CRC', '/backend/images/flag-icons/cr.png', NULL, '2019-04-01 05:34:06', '2019-04-01 05:34:06'),
(19, 'CUBA', 'CU', NULL, '53', 'Cuban peso', 'CUP', '/backend/images/flag-icons/cu.png', NULL, '2019-04-01 05:34:06', '2019-04-01 05:34:06'),
(20, 'CZECH REPUBLIC', 'CZ', NULL, '420', 'Czech koruna', 'CZK', '/backend/images/flag-icons/cz.png', NULL, '2019-04-01 05:34:06', '2019-04-01 05:34:06'),
(21, 'GERMANY', 'DE', NULL, '49', 'Euro', 'EUR', '/backend/images/flag-icons/de.png', NULL, '2019-04-01 05:34:06', '2019-04-01 05:34:06'),
(22, 'DENMARK', 'DK', NULL, '45', 'Danish krone', 'DKK', '/backend/images/flag-icons/dk.png', NULL, '2019-04-01 05:34:06', '2019-04-01 05:34:06'),
(23, 'ECUADOR', 'EC', NULL, '593', 'Ecuadorian sucre', 'ECS', '/backend/images/flag-icons/ec.png', NULL, '2019-04-01 05:34:06', '2019-04-01 05:34:06'),
(24, 'SPAIN', 'ES', NULL, '34', 'Euro', 'EUR', '/backend/images/flag-icons/es.png', NULL, '2019-04-01 05:34:06', '2019-04-01 05:34:06'),
(25, 'FINLAND', 'FI', NULL, '358', 'Euro', 'EUR', '/backend/images/flag-icons/fi.png', NULL, '2019-04-01 05:34:06', '2019-04-01 05:34:06'),
(26, 'FRANCE', 'FR', NULL, '33', 'Euro', 'EUR', '/backend/images/flag-icons/fr.png', NULL, '2019-04-01 05:34:06', '2019-04-01 05:34:06'),
(27, 'UNITED KINGDOM', 'GB', NULL, '44', 'Pound sterling', 'GBP', '/backend/images/flag-icons/gb.png', NULL, '2019-04-01 05:34:06', '2019-04-01 05:34:06'),
(28, 'HONG KONG', 'HK', NULL, '852', 'Hong Kong dollar', 'HKD', '/backend/images/flag-icons/hn.png', NULL, '2019-04-01 05:34:06', '2019-04-01 05:34:06'),
(29, 'INDIA', 'IN', NULL, '91', 'Indian rupee', 'INR', '/backend/images/flag-icons/in.png', NULL, '2019-04-01 05:34:06', '2019-04-01 05:34:06'),
(30, 'IRAQ', 'IQ', NULL, '964', 'Iraqi dinar', 'IQD', '/backend/images/flag-icons/iq.png', NULL, '2019-04-01 05:34:06', '2019-04-01 05:34:06'),
(31, 'JAPAN', 'JP', NULL, '81', 'Japan Yen', 'JPY', '/backend/images/flag-icons/jp.png', NULL, '2019-04-01 05:34:07', '2019-04-01 05:34:07'),
(32, 'KUWAIT', 'KW', NULL, '965', 'Kuwaiti dinar', 'KWD', '/backend/images/flag-icons/kw.png', NULL, '2019-04-01 05:34:07', '2019-04-01 05:34:07'),
(33, 'SRI LANKA', 'LK', NULL, '94', 'Sri Lanka Rupee', 'LKR', '/backend/images/flag-icons/lk.png', NULL, '2019-04-01 05:34:07', '2019-04-01 05:34:07'),
(34, 'MALAYSIA', 'MY', NULL, '60', 'Malaysia Ringgit', 'MYR', '/backend/images/flag-icons/my.png', NULL, '2019-04-01 05:34:07', '2019-04-01 05:34:07'),
(35, 'NETHERLANDS', 'NL', NULL, '31', 'Euro', 'EUR', '/backend/images/flag-icons/nl.png', NULL, '2019-04-01 05:34:07', '2019-04-01 05:34:07'),
(36, 'NEPAL', 'NP', NULL, '977', 'Nepal Rupee', 'NPR', '/backend/images/flag-icons/np.png', NULL, '2019-04-01 05:34:07', '2019-04-01 05:34:07'),
(37, 'NEW ZEALAND', 'NZ', NULL, '64', 'New Zealand dollar', 'NZD', '/backend/images/flag-icons/nz.png', NULL, '2019-04-01 05:34:07', '2019-04-01 05:34:07'),
(38, 'OMAN', 'OM', NULL, '968', 'Omani rial', 'OMR', '/backend/images/flag-icons/om.png', NULL, '2019-04-01 05:34:07', '2019-04-01 05:34:07'),
(39, 'PHILIPPINES', 'PH', NULL, '63', 'Philippines Peso', 'PHP', '/backend/images/flag-icons/ph.png', NULL, '2019-04-01 05:34:07', '2019-04-01 05:34:07'),
(40, 'PAKISTAN', 'PK', NULL, '92', 'Pakistani rupee', 'PKR', '/backend/images/flag-icons/pk.png', NULL, '2019-04-01 05:34:07', '2019-04-01 05:34:07'),
(41, 'POLAND', 'PL', NULL, '48', 'Polish złoty', 'PLN', '/backend/images/flag-icons/pl.png', NULL, '2019-04-01 05:34:07', '2019-04-01 05:34:07'),
(42, 'PORTUGAL', 'PT', NULL, '351', 'Euro', 'EUR', '/backend/images/flag-icons/pt.png', NULL, '2019-04-01 05:34:07', '2019-04-01 05:34:07'),
(43, 'QATAR', 'QA', NULL, '974', 'Qatar Riyal', 'QAR', '/backend/images/flag-icons/qa.png', NULL, '2019-04-01 05:34:07', '2019-04-01 05:34:07'),
(44, 'RUSSIAN FEDERATION', 'RU', NULL, '7', 'Russia Ruble', 'RUB', '/backend/images/flag-icons/ru.png', NULL, '2019-04-01 05:34:07', '2019-04-01 05:34:07'),
(45, 'SAUDI ARABIA', 'SA', NULL, '966', 'Saudi Arabia Riyal', 'SAR', '/backend/images/flag-icons/sa.png', NULL, '2019-04-01 05:34:07', '2019-04-01 05:34:07'),
(46, 'SINGAPORE', 'SG', NULL, '65', 'Singapore Dollar', 'SGD', '/backend/images/flag-icons/sg.png', NULL, '2019-04-01 05:34:07', '2019-04-01 05:34:07'),
(47, 'TURKEY', 'TR', NULL, '90', 'Turkey Lira', 'TRL', '/backend/images/flag-icons/tr.png', NULL, '2019-04-01 05:34:07', '2019-04-01 05:34:07'),
(48, 'UNITED STATES', 'US', NULL, '1', 'United States dollar', 'USD', '/backend/images/flag-icons/us.png', NULL, '2019-04-01 05:34:07', '2019-04-01 05:34:07'),
(49, 'YEMEN', 'YE', NULL, '967', 'Yemeni rial', 'YER', '/backend/images/flag-icons/ye.png', NULL, '2019-04-01 05:34:07', '2019-04-01 05:34:07'),
(50, 'SOUTH AFRICA', 'ZA', NULL, '27', 'South African rand', 'ZAR', '/backend/images/flag-icons/za.png', NULL, '2019-04-01 05:34:07', '2019-04-01 05:34:07'),
(51, 'Ghana', 'GH', NULL, '233', 'Ghanaian Cedi', 'GHS', '/backend/images/flag-icons/za.png', NULL, '2019-04-01 05:34:07', '2019-04-01 05:34:07');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_category`
--

CREATE TABLE `job_category` (
  `id` int(11) NOT NULL,
  `category_name` varchar(255) NOT NULL,
  `status` tinyint(4) NOT NULL DEFAULT 1,
  `deleted_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `job_category`
--

INSERT INTO `job_category` (`id`, `category_name`, `status`, `deleted_at`, `created_at`, `updated_at`) VALUES
(1, 'nnnnnnfdfd', 1, '2024-12-24 07:58:24', '2024-12-24 07:11:03', '2024-12-24 07:58:24'),
(2, 'Sales Executive', 1, NULL, '2024-12-24 07:58:42', '2024-12-24 07:58:42'),
(3, 'Accountant', 1, NULL, '2024-12-24 07:58:51', '2024-12-24 07:58:51'),
(4, 'HR Assistant', 1, NULL, '2024-12-24 07:59:00', '2024-12-24 07:59:00'),
(5, 'Flutter Developer', 1, NULL, '2024-12-24 07:59:43', '2024-12-24 07:59:43'),
(6, 'Android Developer', 1, NULL, '2024-12-24 07:59:53', '2024-12-24 07:59:53'),
(7, 'FontEnd Developer', 1, NULL, '2024-12-24 08:00:04', '2024-12-24 08:00:04');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('NtfBHgwjBFQJtvwrl4LXqHDcGb4mnBB2df0R6IBU', 8, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiWndRVW02UGFlVGV6d0trdEF6TDA2aHBYb0xwaGtNRVJkdEw5dGFmcCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6ODtzOjk6Il9wcmV2aW91cyI7YToxOntzOjM6InVybCI7czoyODoiaHR0cDovLzEyNy4wLjAuMTo4MDAwL2ZpbmlzaCI7fX0=', 1735556607);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `countrycode` int(11) NOT NULL DEFAULT 91,
  `mobile` varchar(191) DEFAULT NULL,
  `user_mobile` varchar(50) DEFAULT NULL,
  `password` varchar(191) NOT NULL,
  `datetime_last_login` datetime DEFAULT NULL,
  `role_id` int(11) NOT NULL,
  `status` int(11) NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `user_name`, `email`, `countrycode`, `mobile`, `user_mobile`, `password`, `datetime_last_login`, `role_id`, `status`, `deleted_at`, `created_at`, `updated_at`) VALUES
(8, 'Shaji', 'shaji@getlead.co.uk', 91, '9995338385', '919995338385', '$2y$10$F1SZkkSzMF0hCn/p7O7.uuOF.siE9rjXptdXP1827jLMP2pxXRXty', '2024-12-30 08:56:35', 1, 1, NULL, '2020-12-22 17:21:56', '2024-12-30 03:26:35'),
(9, 'shaji -test', 'sha@gmail.com', 91, '1236547898', '911236547898', '$2y$12$7fvwcU/4ZFaA8T7leapsruQN8E.zEq287teYNZGD9uioQTYD7iv2e', NULL, 2, 0, NULL, '2024-12-24 00:21:11', '2024-12-24 01:00:29');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `applications`
--
ALTER TABLE `applications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `countries`
--
ALTER TABLE `countries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `job_category`
--
ALTER TABLE `job_category`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `mobile` (`mobile`),
  ADD KEY `vchr_user_name` (`user_name`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `applications`
--
ALTER TABLE `applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `countries`
--
ALTER TABLE `countries`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `job_category`
--
ALTER TABLE `job_category`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
