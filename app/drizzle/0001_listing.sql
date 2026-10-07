CREATE TABLE `listing` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`condition` text NOT NULL,
	`price` integer,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "listing_category_check" CHECK("listing"."category" in ('books', 'electronics', 'furniture', 'clothing', 'sports', 'bikes', 'household', 'other')),
	CONSTRAINT "listing_type_check" CHECK("listing"."type" in ('sale', 'loan', 'giveaway')),
	CONSTRAINT "listing_condition_check" CHECK("listing"."condition" in ('new', 'like_new', 'used')),
	CONSTRAINT "listing_status_check" CHECK("listing"."status" in ('active', 'sold', 'unpublished')),
	CONSTRAINT "listing_price_check" CHECK("listing"."price" is null or "listing"."price" >= 0)
);
--> statement-breakpoint
CREATE INDEX `listing_owner_id_idx` ON `listing` (`owner_id`);