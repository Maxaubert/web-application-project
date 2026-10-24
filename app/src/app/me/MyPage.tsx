// Min side /me (WF-09, #193). Beskyttet av requireUser. Fanene Forespørsler (WF-07) med Mottatt og Sendt, Mine annonser
// (?tab=listings, #229) og Mine favoritter (?tab=favorites, #224); Historikk kommer med #220. Fanene og Mottatt/Sendt er vanlige lenker,
// ikke klientkode, og siden henter bare dataene til fanen som er åpen.
import type { RequestInfo } from "rwsdk/worker";
import { HeaderActions } from "@/app/shared/HeaderActions";
import { PageShell } from "@/app/shared/page-shell";
import { getRequestsForUser } from "@/app/requests/queries";
import { getFavoriteListings } from "@/app/favorites/queries";
import type { ListingWithOwner } from "@/app/listings/queries";
import { db } from "@/db";
import { parseShow, splitRequests, type Show } from "./my-requests";
import { ProfileCard } from "./ProfileCard";
import { getProfile } from "./queries";
import { FavoriteRow } from "./FavoriteRow";
import { getMyListings, type MyListing } from "./my-listings";
import { MyListingRow } from "./MyListingRow";
import { RequestRow } from "./RequestRow";
import { parseTab } from "./tabs";

const emptyText: Record<Show, string> = {
  received: "Du har ikke mottatt noen forespørsler",
  sent: "Du har ikke sendt noen forespørsler",
};

export async function MyPage({ ctx, request }: RequestInfo) {
  const userId = ctx.session.userId ?? "";
  const params = new URL(request.url).searchParams;
  const tab = parseTab(params.get("tab"));
  const profile = await getProfile(db, userId);

  return (
    <PageShell title="Min side" wide headerAction={<HeaderActions current="me" />}>
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">Min side</h1>
        {profile && <ProfileCard profile={profile} />}

        <nav aria-label="Faner" className="mt-6 flex border-b-2 border-hairline">
          <TabLink href="/me" current={tab === "requests"} label="Forespørsler" />
          <TabLink href="/me?tab=listings" current={tab === "listings"} label="Mine annonser" />
          <TabLink href="/me?tab=favorites" current={tab === "favorites"} label="Mine favoritter" />
        </nav>

        {tab === "requests" && <Requests lists={splitRequests(await getRequestsForUser(db, userId))} show={parseShow(params.get("show"))} />}
        {tab === "listings" && <MyListings items={await getMyListings(db, userId)} />}
        {tab === "favorites" && <Favorites items={await getFavoriteListings(db, userId)} />}
      </div>
    </PageShell>
  );
}

function Requests({ lists, show }: { lists: ReturnType<typeof splitRequests>; show: Show }) {
  const items = lists[show];

  return (
    <>
      <nav aria-label="Mottatt og sendt" className="mt-4 inline-flex w-full overflow-hidden rounded-[0.625rem] border-2 border-ink sm:w-auto">
        <ToggleLink href="/me" current={show === "received"} label={`Mottatt (${lists.received.length})`} />
        <ToggleLink href="/me?show=sent" current={show === "sent"} label={`Sendt (${lists.sent.length})`} />
      </nav>
      {items.length === 0 ? (
        <Empty text={emptyText[show]} />
      ) : (
        <ul className={listClass}>
          {items.map((item) => (
            <RequestRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </>
  );
}

// Mine annonser (#229): bare egne aktive annonser, nyeste først (getMyListings).
function MyListings({ items }: { items: MyListing[] }) {
  if (items.length === 0) return <Empty text="Du har ingen annonser" action={{ href: "/listings/new", label: "Legg ut annonse" }} />;
  return (
    <ul className={listClass}>
      {items.map((item) => (
        <MyListingRow key={item.listing.id} item={item} />
      ))}
    </ul>
  );
}

// Mine favoritter (#224): bare aktive annonser, sist lagret først (getFavoriteListings). Fjernes hjertet, tegnes siden på nytt uten raden.
function Favorites({ items }: { items: ListingWithOwner[] }) {
  if (items.length === 0) return <Empty text="Du har ingen favoritter" />;
  return (
    <ul className={listClass}>
      {items.map((item) => (
        <FavoriteRow key={item.listing.id} item={item} />
      ))}
    </ul>
  );
}

const listClass =
  "mt-4 space-y-3.5 sm:space-y-0 sm:divide-y sm:divide-hairline sm:overflow-hidden sm:rounded-xl sm:border-2 sm:border-hairline sm:bg-surface";

function Empty({ text, action = { href: "/", label: "Se annonser" } }: { text: string; action?: { href: string; label: string } }) {
  return (
    <div className="mt-4 rounded-xl border-2 border-dashed border-line px-6 py-8 text-center">
      <p className="text-xl font-bold">{text}</p>
      <a
        href={action.href}
        className="mt-4 inline-flex h-12 items-center rounded-md bg-action px-5 text-lg font-semibold text-white transition-colors hover:bg-action-hover"
      >
        {action.label}
      </a>
    </div>
  );
}

function TabLink({ href, current, label }: { href: string; current: boolean; label: string }) {
  return (
    <a
      href={href}
      aria-current={current ? "page" : undefined}
      className={`-mb-0.5 inline-flex min-h-11 items-center border-b-[3px] px-4 font-semibold ${current ? "border-ink" : "border-transparent text-muted hover:text-ink"}`}
    >
      {label}
    </a>
  );
}

function ToggleLink({ href, current, label }: { href: string; current: boolean; label: string }) {
  return (
    <a
      href={href}
      aria-current={current ? "page" : undefined}
      className={`inline-flex min-h-11 flex-1 items-center justify-center px-7 py-2.5 font-semibold whitespace-nowrap ${current ? "bg-action text-white" : "bg-surface text-ink hover:bg-paper"}`}
    >
      {label}
    </a>
  );
}
