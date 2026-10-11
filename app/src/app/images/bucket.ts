// Appens bildebucket: R2-bindingen IMAGES fra wrangler.jsonc (#138). Lokalt emulerer wrangler den.
import { env } from "cloudflare:workers";
import type { ImageBucket } from "./storage";

export const imageBucket: ImageBucket = env.IMAGES;
