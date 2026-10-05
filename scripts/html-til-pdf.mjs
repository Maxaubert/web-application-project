import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [htmlPath, pdfPath, appDir] = process.argv.slice(2);
const require = createRequire(path.join(appDir, "package.json"));
const { chromium } = require("@playwright/test");
const b = await chromium.launch();
const p = await b.newPage();
await p.goto(pathToFileURL(htmlPath).href, { waitUntil: "load" });
await p.pdf({
  path: pdfPath, format: "A4", printBackground: true, preferCSSPageSize: true,
  displayHeaderFooter: true, headerTemplate: "<span></span>",
  footerTemplate: '<div style="width:100%;font-size:8px;color:#888;text-align:center;font-family:Segoe UI,sans-serif"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
});
await b.close();
console.log("pdf ok");
