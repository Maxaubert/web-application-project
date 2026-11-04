// Hver serverhandling sjekker økten selv (#267, KI-kurset 13): rutevakten beskytter bare sidene, og en handling kan
// kalles direkte. Testen kaller alle eksporterte handlinger i annonser, forespørsler og favoritter, så en ny handling
// uten sjekk blir rød uten at noen husker å skrive en test for den. Innloggingshandlingene i auth/ er for brukere
// uten økt og er ikke med. Godkjent av Max 04.11.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { favorite, listing, offer, request, user } from "@/db/schema";
import type { Db } from "@/db/types";
import { createTestBucket, imageFile, type TestBucket } from "@/test/test-bucket";
import { createTestDb } from "@/test/test-db";
import { insertOwner, OWNER_ID, validListing } from "@/test/test-listings";
import * as favoriteActions from "@/app/favorites/actions";
import * as listingActions from "@/app/listings/actions";
import * as requestActions from "@/app/requests/actions";
import type { AppSession } from "./guards";

const holder = vi.hoisted(() => ({ db: undefined as unknown as Db, session: {} as AppSession, bucket: undefined as unknown as TestBucket }));
vi.mock("@/db", () => ({
  get db() {
    return holder.db;
  },
}));
vi.mock("rwsdk/worker", () => ({
  getRequestInfo: () => ({ ctx: { session: holder.session }, cf: { waitUntil: () => {} } }),
}));
vi.mock("@/app/images/bucket", () => ({
  get imageBucket() {
    return holder.bucket;
  },
}));
vi.mock("@/app/notifications/sender", () => ({ getEmailSender: () => async () => {} }));

type Action = (prev: object, formData: FormData) => Promise<unknown>;
const actions = Object.entries({ ...listingActions, ...requestActions, ...favoriteActions }).filter(
  ([, fn]) => typeof fn === "function",
) as [string, Action][];

// Et skjema som ville ført til skriving hvis sjekken manglet: ekte id-er og gyldige felt.
function hostileForm() {
  const data = new FormData();
  const fields = { listingId: "l1", requestId: "r1", intent: "on", action: "accept", price: "200", title: "Ny tittel",
    description: "Endret.", category: "electronics", type: "sale", condition: "used", startDate: "2026-12-01", endDate: "2026-12-05" };
  for (const [key, value] of Object.entries(fields)) data.append(key, value);
  data.append("images", imageFile("bilde.jpg"));
  return data;
}

async function counts() {
  const db = holder.db;
  return [
    (await db.select().from(listing)).length,
    (await db.select().from(request)).length,
    (await db.select().from(offer)).length,
    (await db.select().from(favorite)).length,
  ];
}

beforeEach(async () => {
  holder.db = createTestDb();
  holder.bucket = createTestBucket();
  await insertOwner(holder.db);
  await holder.db.insert(user).values({ id: "kari", name: "Kari Nordmann", email: "kari@hiof.no" });
  await holder.db.insert(listing).values({ ...validListing(), id: "l1" });
  await holder.db.insert(request).values({ id: "r1", listingId: "l1", requesterId: "kari", status: "waiting_owner" });
  await holder.db.insert(offer).values({ id: "o1", requestId: "r1", senderId: "kari", price: 200 });
  await holder.db.insert(favorite).values({ userId: OWNER_ID, listingId: "l1" });
});

describe("alle serverhandlinger sjekker økten", () => {
  it("finner handlingene", () => {
    expect(actions.length).toBeGreaterThanOrEqual(8);
  });

  it.each(actions)("%s uten økt sender til innlogging og skriver ingenting", async (_name, action) => {
    holder.session = { userId: null, email: null, name: null, needsSetup: false, isAuthenticated: false };
    const before = await counts();

    const result = await action({}, hostileForm());

    expect((result as Response).status).toBe(302);
    expect((result as Response).headers.get("Location")).toBe("/login");
    expect(await counts()).toEqual(before);
  });

  it.each(actions)("%s uten fullført kontooppsett sender til oppsettet og skriver ingenting", async (_name, action) => {
    holder.session = { userId: OWNER_ID, email: "owner-1@hiof.no", name: null, needsSetup: true, isAuthenticated: true };
    const before = await counts();

    const result = await action({}, hostileForm());

    expect((result as Response).status).toBe(302);
    expect((result as Response).headers.get("Location")).toBe("/account-setup");
    expect(await counts()).toEqual(before);
  });
});
