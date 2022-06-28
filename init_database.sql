CREATE TABLE `tag` (
  `tag_value` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`tag_value`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE `user` (
  `gmail_address` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_time_login` date DEFAULT NULL,
  PRIMARY KEY (`gmail_address`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE `img` (
  `img_src` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`img_src`)
) ENGINE = InnoDB AUTO_INCREMENT = 227 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;


CREATE TABLE `article` (
  `article_id` int(11) NOT NULL AUTO_INCREMENT,
  `article_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `article_description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `coordinates` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `position_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `create_time` datetime NOT NULL,
  `edit_time` datetime DEFAULT NULL,
  `website_link` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(25) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `open_times_info` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `main_slider_card_img` int(11) NOT NULL,
  `author_gmail` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `catalog_card_img` int(11) NOT NULL,
  PRIMARY KEY (`article_id`),
  KEY `a_author_gmail` (`author_gmail`),
  KEY `a_main_slider_card_img` (`main_slider_card_img`),
  KEY `a_catalog_card_img` (`catalog_card_img`),
  KEY `article_index_description` (`article_description`(768)),
  KEY `article_index_title` (`article_name`),
  FULLTEXT KEY `article_name` (`article_name`, `article_description`),
  CONSTRAINT `a_author_gmail` FOREIGN KEY (`author_gmail`) REFERENCES `user` (`gmail_address`) ON DELETE CASCADE ON
  UPDATE
    CASCADE,
    CONSTRAINT `a_catalog_card_img` FOREIGN KEY (`catalog_card_img`) REFERENCES `img` (`img_src`) ON DELETE CASCADE ON
  UPDATE
    CASCADE,
    CONSTRAINT `a_main_slider_card_img` FOREIGN KEY (`main_slider_card_img`) REFERENCES `img` (`img_src`) ON DELETE CASCADE ON
  UPDATE
    CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 42 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE `article_slider_imgs` (
  `relation_id` int(11) NOT NULL AUTO_INCREMENT,
  `article_id` int(11) NOT NULL,
  `img_src` int(11) NOT NULL,
  PRIMARY KEY (`relation_id`),
  KEY `asi_slider_article_id` (`article_id`),
  KEY `asi_img_src` (`img_src`),
  CONSTRAINT `asi_img_src` FOREIGN KEY (`img_src`) REFERENCES `img` (`img_src`) ON DELETE CASCADE ON
  UPDATE
    CASCADE,
    CONSTRAINT `asi_slider_article_id` FOREIGN KEY (`article_id`) REFERENCES `article` (`article_id`) ON DELETE CASCADE ON
  UPDATE
    CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 48 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE `article_to_tag` (
  `relation_id` int(11) NOT NULL AUTO_INCREMENT,
  `article_id` int(11) NOT NULL,
  `tag_value` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`relation_id`),
  KEY `at_article_id` (`article_id`),
  KEY `at_tag_value` (`tag_value`),
  CONSTRAINT `at_article_id` FOREIGN KEY (`article_id`) REFERENCES `article` (`article_id`) ON DELETE CASCADE ON
  UPDATE
    CASCADE,
    CONSTRAINT `at_tag_value` FOREIGN KEY (`tag_value`) REFERENCES `tag` (`tag_value`) ON DELETE CASCADE ON
  UPDATE
    CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 140 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE `favourite_articles` (
  `relation_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_gmail_address` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `article_id` int(11) NOT NULL,
  PRIMARY KEY (`relation_id`),
  KEY `fa_user_gmail_address` (`user_gmail_address`),
  KEY `fa_article_id` (`article_id`),
  CONSTRAINT `fa_article_id` FOREIGN KEY (`article_id`) REFERENCES `article` (`article_id`) ON DELETE CASCADE ON
  UPDATE
    CASCADE,
    CONSTRAINT `fa_user_gmail_address` FOREIGN KEY (`user_gmail_address`) REFERENCES `user` (`gmail_address`) ON DELETE CASCADE ON
  UPDATE
    CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 73 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;


CREATE TABLE `related_articles` (
  `relation_id` int(11) NOT NULL AUTO_INCREMENT,
  `article_id` int(11) NOT NULL,
  `related_article_id` int(11) NOT NULL,
  PRIMARY KEY (`relation_id`),
  KEY `ra_article_id` (`article_id`),
  KEY `ra_related_article_id` (`related_article_id`),
  CONSTRAINT `ra_article_id` FOREIGN KEY (`article_id`) REFERENCES `article` (`article_id`) ON DELETE CASCADE ON
  UPDATE
    CASCADE,
    CONSTRAINT `ra_related_article_id` FOREIGN KEY (`related_article_id`) REFERENCES `article` (`article_id`) ON DELETE CASCADE ON
  UPDATE
    CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 25 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE `user_rating` (
  `relation_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_gmail_address` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `article_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL,
  PRIMARY KEY (`relation_id`),
  KEY `rating_article` (`article_id`),
  KEY `rating_user` (`user_gmail_address`),
  CONSTRAINT `rating_article` FOREIGN KEY (`article_id`) REFERENCES `article` (`article_id`) ON DELETE CASCADE ON
  UPDATE
    CASCADE,
    CONSTRAINT `rating_user` FOREIGN KEY (`user_gmail_address`) REFERENCES `user` (`gmail_address`) ON DELETE CASCADE ON
  UPDATE
    CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 17 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;