import { render, route } from "rwsdk/router";
import { defineApp } from "rwsdk/worker";

import { Document } from "@/app/document";
import { setCommonHeaders } from "@/app/headers";
import { devLogin } from "@/app/auth/dev-login";
import { getAuth } from "@/app/auth/instance";
import { AccountSetupPage, CodePage, LoginPage } from "@/app/auth/pages";
import { requireAnonymous, requireApiUser, requireSetupPending, requireUser, type AppSession } from "@/app/auth/guards";
import { sessionMiddleware } from "@/app/auth/session";
import { HomePage } from "@/app/home/HomePage";
import { serveImage } from "@/app/images/serve-image";
import { getListings } from "@/app/listings/api";
import { ListingPage } from "@/app/listings/ListingPage";
import { NewListingPage } from "@/app/listings/NewListingPage";

export type AppContext = { session: AppSession };

export default defineApp([
  setCommonHeaders(),
  sessionMiddleware,
  // better-auth sine egne endepunkter. Domene- og kodegrensen gjelder også her (hooks i auth.ts).
  route("/api/auth/*", ({ request }) => getAuth().handler(request)),
  // REST for søket (T03, #98). Bare GET; andre metoder gir 405 fra RedwoodSDK.
  route("/api/listings", { get: [requireApiUser, getListings] }),
  // Annonsebilder fra R2, bare for innloggede (#138).
  route("/images/listings/:listingId/:file", { get: [requireApiUser, serveImage] }),
  // Lokal innloggingssnarvei (#106). Lås nr. 1: Vite setter DEV til false i produksjonsbygget, så
  // ruten aldri registreres der og koden fjernes.
  ...(import.meta.env.DEV ? [route("/dev/login", devLogin)] : []),
  render(Document, [
    route("/", [requireUser, HomePage]),
    // Før /listings/:id, ellers ville «new» blitt lest som en annonse-ID.
    route("/listings/new", [requireUser, NewListingPage]),
    route("/listings/:id", [requireUser, ListingPage]),
    route("/login", [requireAnonymous, LoginPage]),
    route("/login/code", [requireAnonymous, CodePage]),
    route("/account-setup", [requireSetupPending, AccountSetupPage]),
  ]),
]);
