DROP USER IF EXISTS 'dbuser'@'localhost';
CREATE USER IF NOT EXISTS 'dbuser'@'localhost' IDENTIFIED BY 'cmmAyskQwmAI1fQ7vJM7';

DROP DATABASE IF EXISTS app;
CREATE DATABASE IF NOT EXISTS app;
USE app;

/**User and authentication data**/
CREATE TABLE `users`(
    `id` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(255) NOT NULL,
    `last_name` VARCHAR(255) NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `phone_number` VARCHAR(255) NOT NULL,
    `insurance_company` VARCHAR(255) NOT NULL,
    `dashcam` TINYINT NOT NULL,
    `creation_ip` VARCHAR(128) NOT NULL,
    `last_ip` VARCHAR(128) NOT NULL,
    `validated` TINYINT NOT NULL DEFAULT 0,
    `modified` DATETIME NOT NULL DEFAULT NOW(),
    PRIMARY KEY (`id`)
) engine=InnoDB;

CREATE TABLE `session_tokens`(
    `user` VARCHAR(255) NOT NULL,
    `token` VARCHAR(1024) NOT NULL,
    `date` DATETIME DEFAULT NOW(),
    CONSTRAINT FOREIGN KEY (`user`) REFERENCES `users`(`id`) ON DELETE CASCADE
) engine=InnoDB;

/*Permissions system*/
CREATE TABLE `groups`(
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `modified` DATETIME NOT NULL DEFAULT NOW()
) engine=InnoDB;

CREATE TABLE `group_permissions`(
    `group` INT NOT NULL,
    `permission` VARCHAR(255) NOT NULL,
    CONSTRAINT FOREIGN KEY (`group`) REFERENCES `groups`(`id`) ON DELETE CASCADE
) engine=InnoDB;

CREATE TABLE `user_permissions`(
    `user` VARCHAR(255) NOT NULL,
    `permission` VARCHAR(255) NOT NULL,
    CONSTRAINT FOREIGN KEY (`user`) REFERENCES `users`(`id`) ON DELETE CASCADE
) engine=InnoDB;

CREATE TABLE `group_memberships`(
    `user` VARCHAR(255) NOT NULL,
    `group` INT NOT NULL,
    CONSTRAINT FOREIGN KEY (`user`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (`group`) REFERENCES `groups`(`id`) ON DELETE CASCADE
) engine=InnoDB;

/*Quizzes*/
CREATE TABLE `quizzes` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `author` VARCHAR(255) NOT NULL,
    `modified` DATETIME NOT NULL DEFAULT NOW(),
    CONSTRAINT FOREIGN KEY (`author`) REFERENCES `users`(`id`) ON DELETE CASCADE
) engine=InnoDB;

CREATE TABLE `quiz_questions` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `quiz` INT NOT NULL,
    `text` VARCHAR(255) NOT NULL,
    CONSTRAINT FOREIGN KEY (`quiz`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE
) engine=InnoDB;

CREATE TABLE `question_choices` (
    `question` INT NOT NULL,
    `text` VARCHAR(255),
    `correct` TINYINT NOT NULL DEFAULT 0,
    CONSTRAINT FOREIGN KEY (`question`) REFERENCES `quiz_questions`(`id`) ON DELETE CASCADE
) engine=InnoDB;

/*Accident reports*/
CREATE TABLE `cities`(
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT, 
    `name` VARCHAR(100) NOT NULL,
    `state` ENUM('AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','PR') NOT NULL,
    `country` ENUM('US', 'CA', 'MX') NOT NULL,
    `latitude` FLOAT NOT NULL,
    `longitude`  FLOAT NOT NULL 
) engine=InnoDB;

CREATE TABLE `accident_reports`(
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `author` VARCHAR(255) NOT NULL,
    `city` INT NOT NULL,
    `date` DATETIME NOT NULL,
    `clear` TINYINT NOT NULL DEFAULT 0,
    `rain` TINYINT NOT NULL DEFAULT 0,
    `snow` TINYINT NOT NULL DEFAULT 0,
    `hail` TINYINT NOT NULL DEFAULT 0,
    `fog` TINYINT NOT NULL DEFAULT 0,
    `high_winds` TINYINT NOT NULL DEFAULT 0,
    CONSTRAINT FOREIGN KEY (`city`) REFERENCES `cities`(`id`) ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (`author`) REFERENCES `users`(`id`)
) engine=InnoDB;

CREATE TABLE `rivalries`(
    `city1` int,
    `city2` int,
    CONSTRAINT FOREIGN KEY (`city1`) REFERENCES `cities`(`id`) ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (`city2`) REFERENCES `cities`(`id`) ON DELETE CASCADE
) engine=InnoDB;

/*Security and spam prevention*/
CREATE TABLE `activity_logs`(
    `user` VARCHAR(255) NULL,
    `ip_address` VARCHAR(128) NOT NULL,
    `action` ENUM('CREATE_ACCOUNT', '') NOT NULL,
    `date` DATETIME NOT NULL DEFAULT NOW(),
    CONSTRAINT FOREIGN KEY (`user`) REFERENCES `users`(`id`) ON DELETE CASCADE
) engine=InnoDB;

GRANT ALL PRIVILEGES ON app.* TO 'dbuser'@'localhost';

/*Default data*/
INSERT INTO `groups` (`name`) VALUES ('root'), ('admin'), ('user');

INSERT INTO `group_permissions` (`group`, `permission`) VALUES
(1, 'quiz.create'),
(1, 'quiz.modify.self'),
(1, 'quiz.modify.other'),
(1, 'quiz.delete.self'),
(1, 'quiz.delete.other'),
(1, 'group.modify'),
(1, 'group.create'),
(1, 'group.delete'),
(1, 'controlpanel.view'),
(2, 'quiz.create'),
(2, 'quiz.modify.self'),
(2, 'quiz.modify.other'),
(2, 'quiz.delete.self'),
(2, 'quiz.delete.other'),
(2, 'group.modify'),
(2, 'group.create'),
(2, 'group.delete'),
(2, 'controlpanel.view');

INSERT INTO `users` (`id`, `email`, `password_hash`, `first_name`, `last_name`, `address`, `phone_number`, `insurance_company`, `dashcam`, `creation_ip`, `last_ip`, `validated`) VALUES ('c3b06734-fa42-48ff-becf-043f6801cc1d', 'admin@gmail.com', '$2y$10$f47LdJAYSB2IUnNUDcPMZuVGjjh94APRwsZH6hgNftg3dL7pdIswu', 'Admin', 'Account', 'Admin street', '555-555-5555', 'Gieco', 1, '127.0.0.1', '127.0.0.1', 1);

INSERT INTO `group_memberships` (`user`, `group`) VALUES
('c3b06734-fa42-48ff-becf-043f6801cc1d', 1),
('c3b06734-fa42-48ff-becf-043f6801cc1d', 2), 
('c3b06734-fa42-48ff-becf-043f6801cc1d', 3);


