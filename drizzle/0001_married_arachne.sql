CREATE TABLE `agentTasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`taskType` varchar(64) NOT NULL,
	`prompt` text NOT NULL,
	`result` text,
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`coinsCost` bigint DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `agentTasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coinTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amount` bigint NOT NULL,
	`type` enum('earn','spend','admin_adjust') NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coinTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `systemStats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`totalUsers` int DEFAULT 0,
	`totalCoinsDistributed` bigint DEFAULT 0,
	`totalTasksCompleted` int DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `systemStats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `openId` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `username` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` text;--> statement-breakpoint
ALTER TABLE `users` ADD `ipAddress` varchar(45);--> statement-breakpoint
ALTER TABLE `users` ADD `coins` bigint DEFAULT 1000 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_username_unique` UNIQUE(`username`);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);