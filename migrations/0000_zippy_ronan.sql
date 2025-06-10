CREATE TABLE `cacheRequests` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text DEFAULT '' NOT NULL,
	`createdOn` integer,
	`updatedOn` integer,
	`deletedOn` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cacheRequests_url_unique` ON `cacheRequests` (`url`);--> statement-breakpoint
CREATE UNIQUE INDEX `url` ON `cacheRequests` (`url`);--> statement-breakpoint
CREATE TABLE `cacheStats` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`createdOn` integer NOT NULL,
	`executionTime` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`body` text,
	`createdOn` integer,
	`updatedOn` integer
);
--> statement-breakpoint
CREATE TABLE `categoriesToPosts` (
	`id` text NOT NULL,
	`postId` text NOT NULL,
	`categoryId` text NOT NULL,
	`createdOn` integer,
	`updatedOn` integer,
	PRIMARY KEY(`postId`, `categoryId`),
	FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`body` text NOT NULL,
	`userId` text NOT NULL,
	`postId` integer NOT NULL,
	`tags` text,
	`createdOn` integer,
	`updatedOn` integer
);
--> statement-breakpoint
CREATE INDEX `commentsUserIdIndex` ON `comments` (`userId`);--> statement-breakpoint
CREATE INDEX `commentsPostIdIndex` ON `comments` (`postId`);--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` text PRIMARY KEY NOT NULL,
	`firstName` text,
	`lastName` text,
	`company` text,
	`email` text,
	`phone` text,
	`message` text,
	`createdOn` integer,
	`updatedOn` integer
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` text PRIMARY KEY NOT NULL,
	`firstName` text,
	`lastName` text,
	`fullName` text,
	`email` text,
	`phone` text,
	`jobTitle` text,
	`department` text,
	`gender` text,
	`region` text,
	`password` text,
	`role` text,
	`createdOn` integer,
	`updatedOn` integer
);
--> statement-breakpoint
CREATE TABLE `faqs` (
	`id` text PRIMARY KEY NOT NULL,
	`question` text,
	`answer` text,
	`sort` integer DEFAULT 100,
	`createdOn` integer,
	`updatedOn` integer
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`userId` text NOT NULL,
	`image` text,
	`images` text,
	`tags` text,
	`createdOn` integer,
	`updatedOn` integer
);
--> statement-breakpoint
CREATE INDEX `postUserIdIndex` ON `posts` (`userId`);--> statement-breakpoint
CREATE TABLE `programs` (
	`id` text PRIMARY KEY NOT NULL,
	`type` integer,
	`title` text,
	`slug` text,
	`description` text,
	`descriptionAI` text,
	`source` text,
	`frequencies` text,
	`tags` text,
	`sort` integer DEFAULT 10,
	`userId` text,
	`createdOn` integer,
	`updatedOn` integer
);
--> statement-breakpoint
CREATE TABLE `userSessions` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`activeExpires` integer NOT NULL,
	`idleExpires` integer NOT NULL,
	`createdOn` integer,
	`updatedOn` integer,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`firstName` text,
	`lastName` text,
	`profile` text,
	`email` text,
	`emailConfirmedOn` integer,
	`emailConfirmationToken` text,
	`password` text NOT NULL,
	`passwordOTP` text,
	`passwordOTPExpiresOn` integer,
	`passwordResetCode` text,
	`passwordResetCodeExpiresOn` integer,
	`role` text DEFAULT 'user',
	`createdOn` integer,
	`updatedOn` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `email_idx` ON `users` (lower("email"));