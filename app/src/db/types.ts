// Felles databasetype: D1 i appen, SQLite i minnet i testene. Samme Drizzle-spørringer begge steder.
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import type * as schema from "./schema";

export type Db = BaseSQLiteDatabase<"sync" | "async", unknown, typeof schema>;
