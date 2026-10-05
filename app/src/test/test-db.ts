// Testdatabase etter kursets mønster (KI-kurset leksjon 8a): SQLite i minnet med de samme
// migrasjonene som appen. Appkoden er uendret; bare driveren byttes.
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "@/db/schema";
import type { Db } from "@/db/types";

export function createTestDb(): Db {
  const db = drizzle(new Database(":memory:"), { schema });
  migrate(db, { migrationsFolder: "drizzle" });
  return db;
}
