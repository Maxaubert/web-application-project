// Databasetabeller. Auth-tabellene følger better-auth sin modell (user, session, account,
// verification, rateLimit); feltene er hentet fra better-auth 1.7 for vår konfigurasjon.
import { sql } from "drizzle-orm";
import { check, index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const createdAt = () =>
  integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`);
const updatedAt = () =>
  integer("updated_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`);

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  // Settes i kontooppsettet, lagret som E.164 (+4791234567). Tom betyr at oppsettet ikke er gjort.
  phone: text("phone"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp_ms" }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp_ms" }),
    scope: text("scope"),
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
);

// Her lagrer better-auth engangskodene (hashet) med utløpstid.
export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

// better-auth sin egen grense per IP-adresse (et ekstra lag).
export const rateLimit = sqliteTable("rate_limit", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: integer("last_request").notNull(),
});

// Vår grense per e-postadresse: 5 koder per time og 60 s mellom koder.
// Lagrer en SHA-256-hash av adressen, aldri selve adressen.
export const loginCodeRequest = sqliteTable(
  "login_code_request",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    emailHash: text("email_hash").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [index("login_code_request_email_hash_idx").on(table.emailHash, table.createdAt)],
);

// Annonser (WF-03 til WF-05). Kategorilisten er låst og kan utvides (#62). Bilder kommer med #61.
export const listingCategories = [
  "books",
  "electronics",
  "furniture",
  "clothing",
  "sports",
  "bikes",
  "household",
  "other",
] as const;
export const listingTypes = ["sale", "loan", "giveaway"] as const;
export const listingConditions = ["new", "like_new", "used"] as const;
export const listingStatuses = ["active", "sold", "unpublished"] as const;

export const listing = sqliteTable(
  "listing",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type", { enum: listingTypes }).notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    category: text("category", { enum: listingCategories }).notNull(),
    condition: text("condition", { enum: listingConditions }).notNull(),
    // Hele kroner. Salg: pris. Lån: ukepris, tom betyr gratis. Gis bort: tom.
    price: integer("price"),
    status: text("status", { enum: listingStatuses }).notNull().default("active"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  // Databasen avviser ukjente verdier også om koden har en feil (samme verdier som listene over).
  (table) => [
    index("listing_owner_id_idx").on(table.ownerId),
    check(
      "listing_category_check",
      sql`${table.category} in ('books', 'electronics', 'furniture', 'clothing', 'sports', 'bikes', 'household', 'other')`,
    ),
    check("listing_type_check", sql`${table.type} in ('sale', 'loan', 'giveaway')`),
    check("listing_condition_check", sql`${table.condition} in ('new', 'like_new', 'used')`),
    check("listing_status_check", sql`${table.status} in ('active', 'sold', 'unpublished')`),
    check("listing_price_check", sql`${table.price} is null or ${table.price} >= 0`),
  ],
);

export type Listing = typeof listing.$inferSelect;
