CREATE TABLE `listing_image` (
	`id` text PRIMARY KEY NOT NULL,
	`listing_id` text NOT NULL,
	`key` text NOT NULL,
	`position` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`listing_id`) REFERENCES `listing`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "listing_image_position_check" CHECK("listing_image"."position" >= 0 and "listing_image"."position" < 10)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `listing_image_key_unique` ON `listing_image` (`key`);--> statement-breakpoint
CREATE INDEX `listing_image_listing_id_idx` ON `listing_image` (`listing_id`);