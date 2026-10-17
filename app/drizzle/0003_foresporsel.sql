CREATE TABLE `offer` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`sender_id` text NOT NULL,
	`price` integer,
	`start_date` text,
	`end_date` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`request_id`) REFERENCES `request`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`sender_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "offer_price_check" CHECK("offer"."price" is null or "offer"."price" >= 0),
	CONSTRAINT "offer_dates_format_check" CHECK(("offer"."start_date" is null or "offer"."start_date" glob '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]') and ("offer"."end_date" is null or "offer"."end_date" glob '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]')),
	CONSTRAINT "offer_dates_pair_check" CHECK(("offer"."start_date" is null) = ("offer"."end_date" is null)),
	CONSTRAINT "offer_dates_order_check" CHECK("offer"."start_date" is null or "offer"."end_date" >= "offer"."start_date")
);
--> statement-breakpoint
CREATE INDEX `offer_request_id_idx` ON `offer` (`request_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `request` (
	`id` text PRIMARY KEY NOT NULL,
	`listing_id` text NOT NULL,
	`requester_id` text NOT NULL,
	`status` text DEFAULT 'waiting_owner' NOT NULL,
	`owner_confirmed` integer DEFAULT false NOT NULL,
	`requester_confirmed` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`listing_id`) REFERENCES `listing`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`requester_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "request_status_check" CHECK("request"."status" in ('waiting_owner', 'waiting_requester', 'accepted', 'declined', 'withdrawn', 'expired', 'cancelled', 'in_use', 'completed'))
);
--> statement-breakpoint
CREATE INDEX `request_listing_id_status_idx` ON `request` (`listing_id`,`status`);--> statement-breakpoint
CREATE INDEX `request_requester_id_idx` ON `request` (`requester_id`);