import { render, route } from "rwsdk/router";
import { defineApp } from "rwsdk/worker";

import { Document } from "@/app/document";
import { setCommonHeaders } from "@/app/headers";
import Login from "./login";

export type AppContext = Record<string, never>;

export default defineApp([
  setCommonHeaders(),
  render(Document, [route("/", () => <Login />)]),
]);
