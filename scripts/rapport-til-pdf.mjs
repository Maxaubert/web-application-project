// Lager rapportens PDF fra Markdown-kilden. Fra repo-roten:
// node scripts/rapport-til-pdf.mjs docs/leveranser/rapport/rapport.md docs/leveranser/rapport/rapport.pdf
// Støtter det rapporten bruker: overskrifter, avsnitt, *kursiv*, `kode` og
// HTML-kommentarer, som vises som grå veiledning under overskriften.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const [src, out] = process.argv.slice(2).map((p) => path.resolve(p));
const require = createRequire(path.resolve("app/package.json"));
const { chromium } = require("@playwright/test");

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const inline = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*([^*]+)\*/g, "<em>$1</em>");

const blocks = fs.readFileSync(src, "utf8").split(/\n\s*\n/);
let body = "";
for (const raw of blocks) {
  const b = raw.trim();
  if (!b) continue;
  const note = b.match(/^<!--\s*([\s\S]*?)\s*-->$/);
  const lead = b.match(/^<!--\s*([\s\S]*?)\s*-->\n([\s\S]+)$/);
  if (note && !/KI-utkast/.test(note[1])) body += `<p class="guide">${inline(note[1])}</p>\n`;
  else if (lead) body += `<p>${inline(lead[2].replace(/\n/g, " "))}</p>\n`;
  else if (note) continue;
  else if (b.startsWith("## ")) body += `<h2>${inline(b.slice(3))}</h2>\n`;
  else if (b.startsWith("# ")) body += `<h1>${inline(b.slice(2))}</h1>\n`;
  else body += `<p>${inline(b.replace(/\n/g, " "))}</p>\n`;
}

const html = `<!doctype html><html lang="nb"><meta charset="utf-8"><title>Rapport</title><style>
@page { size: A4; margin: 20mm 20mm 18mm; }
body { font-family: "Segoe UI", system-ui, sans-serif; color: #1c1c1c; font-size: 10.5pt; line-height: 1.5; margin: 0; }
h1 { font-size: 20pt; line-height: 1.2; margin: 0 0 6pt; font-weight: 650; }
h2 { font-size: 13pt; margin: 18pt 0 4pt; padding-bottom: 3pt; border-bottom: 1px solid #d0d0d0; font-weight: 650; }
p { margin: 0 0 7pt; } em { color: #555; }
.guide { color: #888; font-style: italic; }
code { font-family: Consolas, monospace; font-size: 9.5pt; background: #f2f2f2; padding: 0 3pt; }
</style><body>${body}</body></html>`;

const tmp = out.replace(/\.pdf$/, ".tmp.html");
fs.writeFileSync(tmp, html);
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(tmp).href);
await page.pdf({ path: out, format: "A4", printBackground: true, preferCSSPageSize: true });
await browser.close();
fs.unlinkSync(tmp);
console.log("pdf ok", path.relative(process.cwd(), out));
