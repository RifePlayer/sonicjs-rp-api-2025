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
CREATE TABLE `faqs` (
	`id` text PRIMARY KEY NOT NULL,
	`question` text,
	`answer` text,
	`sort` integer DEFAULT 100,
	`createdOn` integer,
	`updatedOn` integer
);
--> statement-breakpoint
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
