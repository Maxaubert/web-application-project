import { render, route } from "rwsdk/router";
import { defineApp } from "rwsdk/worker";

import { Document } from "@/app/document";
import { setCommonHeaders } from "@/app/headers";
import { getAuth } from "@/app/auth/instance";
import { AccountSetupPage, CodePage, LoginPage } from "@/app/auth/pages";
import { requireAnonymous, requireApiUser, requireSetupPending, requireUser, type AppSession } from "@/app/auth/guards";
import { sessionMiddleware } from "@/app/auth/session";
import { HomePage } from "@/app/home/HomePage";
import { getListings } from "@/app/listings/api";
import { ListingPage } from "@/app/listings/ListingPage";

export type AppContext = { session: AppSession };

export default defineApp([
  setCommonHeaders(),
  sessionMiddleware,
  // better-auth sine egne endepunkter. Domene- og kodegrensen gjelder også her (hooks i auth.ts).
  route("/api/auth/*", ({ request }) => getAuth().handler(request)),
  // REST for søket (T03, #98). Bare GET; andre metoder gir 405 fra RedwoodSDK.
  route("/api/listings", { get: [requireApiUser, getListings] }),
  render(Document, [
    route("/", [requireUser, HomePage]),
    route("/listings/:id", [requireUser, ListingPage]),
    route("/login", [requireAnonymous, LoginPage]),
    route("/login/code", [requireAnonymous, CodePage]),
    route("/account-setup", [requireSetupPending, AccountSetupPage]),
  ]),
]);
