// Det eneste stedet varslene leser fra databasen (#256), etter Marius' repository-mønster: begge parters navn og e-post og
// annonsens tittel, så notify.ts kan finne motparten.
import { alias } from "drizzle-orm/sqlite-core";
import { eq } from "drizzle-orm";
import { listing, request, user, type Listing } from "@/db/schema";
import type { Db } from "@/db/types";

export type Parties = {
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  title: string;
  type: Listing["type"];
};

export interface NotifyRepository {
  findParties(requestId: string): Promise<Parties | undefined>;
}

export function createNotifyRepository(db: Db): NotifyRepository {
  return {
    async findParties(requestId) {
      const owner = alias(user, "owner");
      const requester = alias(user, "requester");
      const rows = await db
        .select({
          ownerId: owner.id,
          ownerName: owner.name,
          ownerEmail: owner.email,
          requesterId: requester.id,
          requesterName: requester.name,
          requesterEmail: requester.email,
          title: listing.title,
          type: listing.type,
        })
        .from(request)
        .innerJoin(listing, eq(request.listingId, listing.id))
        .innerJoin(owner, eq(listing.ownerId, owner.id))
        .innerJoin(requester, eq(request.requesterId, requester.id))
        .where(eq(request.id, requestId))
        .limit(1);
      return rows[0];
    },
  };
}
