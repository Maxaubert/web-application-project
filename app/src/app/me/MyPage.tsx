// Min side /me (WF-09, #193). Beskyttet av requireUser. Foreløpig bare fanen Forespørsler (WF-07) med Mottatt og Sendt;
// Mine annonser og Historikk kommer med #189 og #93. Mottatt og Sendt er vanlige lenker (?show=sent), ikke klientkode.
import type { RequestInfo } from "rwsdk/worker";
import { HeaderActions } from "@/app/shared/HeaderActions";
import { PageShell } from "@/app/shared/page-shell";
import { getRequestsForUser } from "@/app/requests/queries";
import { db } from "@/db";
import { parseShow, splitRequests, type Show } from "./my-requests";
import { ProfileCard } from "./ProfileCard";
import { getProfile } from "./queries";
import { RequestRow } from "./RequestRow";

const emptyText: Record<Show, string> = {
  received: "Du har ikke mottatt noen forespørsler",
  sent: "Du har ikke sendt noen forespørsler",
};

export async function MyPage({ ctx, request }: RequestInfo) {
  const userId = ctx.session.userId ?? "";
  const show = parseShow(new URL(request.url).searchParams.get("show"));
  const [profile, all] = await Promise.all([getProfile(db, userId), getRequestsForUser(db, userId)]);
  const lists = splitRequests(all);
  const items = lists[show];

  return (
    <PageShell title="Min side" wide headerAction={<HeaderActions current="me" />}>
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">Min side</h1>
        {profile && <ProfileCard profile={profile} />}

        {/* Én fane foreløpig; de to andre kommer med #189 og #93. */}
        <nav aria-label="Faner" className="mt-6 flex border-b-2 border-hairline">
          <a
            href="/me"
            aria-current="page"
            className="-mb-0.5 inline-flex min-h-11 items-center border-b-[3px] border-ink px-4 font-semibold"
          >
            Forespørsler
          </a>
        </nav>

        <nav aria-label="Mottatt og sendt" className="mt-4 inline-flex w-full overflow-hidden rounded-[0.625rem] border-2 border-ink sm:w-auto">
          <ToggleLink href="/me" current={show === "received"} label={`Mottatt (${lists.received.length})`} />
          <ToggleLink href="/me?show=sent" current={show === "sent"} label={`Sendt (${lists.sent.length})`} />
        </nav>

        {items.length === 0 ? (
          <div className="mt-4 rounded-xl border-2 border-dashed border-line px-6 py-8 text-center">
            <p className="text-xl font-bold">{emptyText[show]}</p>
            <a
              href="/"
              className="mt-4 inline-flex h-12 items-center rounded-md bg-action px-5 text-lg font-semibold text-white transition-colors hover:bg-action-hover"
            >
              Se annonser
            </a>
          </div>
        ) : (
          <ul className="mt-4 space-y-3.5 sm:space-y-0 sm:divide-y sm:divide-hairline sm:overflow-hidden sm:rounded-xl sm:border-2 sm:border-hairline sm:bg-surface">
            {items.map((item) => (
              <RequestRow key={item.id} item={item} />
            ))}
          </ul>
        )}
      </div>
    </PageShell>
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
