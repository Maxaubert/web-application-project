// Renders Design-canvas .dc.html artboards to plain HTML and PNG (local, no network).
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const [srcDir, outDir, appDir] = process.argv.slice(2);
const require = createRequire(path.join(appDir, "package.json"));
const { chromium } = require("@playwright/test");
const canvas = JSON.parse(fs.readFileSync(path.join(srcDir, "canvas.json"), "utf8"));

class DCLogic { constructor(props) { this.props = props || {}; this.state = {}; } setState() {} forceUpdate() {} }
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
function lookup(expr, scope) {
  const e = expr.trim();
  if (e === "true") return true; if (e === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(e)) return Number(e);
  return e.split(".").reduce((o, k) => (o == null ? undefined : o[k]), scope);
}
function holes(str, scope) {
  return str.replace(/\{\{([^}]*)\}\}/g, (_, e) => { const v = lookup(e, scope); return v == null || typeof v === "function" ? "" : esc(v); });
}
function block(str, scope) {
  const open = /<sc-(for|if)\b([^>]*)>/g;
  const m = open.exec(str);
  if (!m) return holes(str, scope);
  const tag = "sc-" + m[1];
  let depth = 1, i = m.index + m[0].length, end = -1;
  const re = new RegExp(`<${tag}\\b[^>]*>|</${tag}>`, "g"); re.lastIndex = i;
  let t;
  while ((t = re.exec(str))) { depth += t[0].startsWith("</") ? -1 : 1; if (depth === 0) { end = t.index; break; } }
  const inner = str.slice(i, end), after = str.slice(end + tag.length + 3);
  const attr = (n) => { const a = new RegExp(`${n}="\\{\\{([^}]*)\\}\\}"|${n}="([^"]*)"`).exec(m[2]); return a ? (a[1] !== undefined ? lookup(a[1], scope) : a[2]) : undefined; };
  let out = "";
  if (m[1] === "for") {
    const list = attr("list") || [], as = attr("as");
    list.forEach((item, idx) => { out += block(inner, { ...scope, [as]: item, $index: idx }); });
  } else if (attr("value")) out = block(inner, scope);
  return holes(str.slice(0, m.index), scope) + out + block(after, scope);
}
function render(file) {
  const s = fs.readFileSync(path.join(srcDir, file), "utf8");
  const helmet = /<helmet>([\s\S]*?)<\/helmet>/.exec(s)[1];
  const tpl = s.slice(s.indexOf("</helmet>") + 9, s.lastIndexOf("</x-dc>"));
  const js = /<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/.exec(s)[1];
  const Component = new Function("DCLogic", js + "\nreturn Component;")(DCLogic);
  const scope = new Component({}).renderVals();
  const title = /<title>([^<]*)<\/title>/.exec(s)[1];
  return `<!doctype html><html lang="nb"><head><meta charset="utf-8"><title>${title}</title>${helmet}</head><body>${block(tpl, scope)}</body></html>`;
}

fs.mkdirSync(path.join(outDir, "png"), { recursive: true });
fs.mkdirSync(path.join(outDir, "html"), { recursive: true });
const browser = await chromium.launch();
const names = Object.keys(canvas.boards).filter((f) => f !== "Gjennomgang.dc.html").sort();
for (const f of names) {
  const { w, h } = canvas.boards[f];
  const base = f.replace(/\.dc\.html$/, "");
  const html = render(f);
  const htmlPath = path.join(outDir, "html", base + ".html");
  fs.writeFileSync(htmlPath, html);
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.goto("file:///" + htmlPath.replace(/\\/g, "/"));
  await page.locator("body > *").first().screenshot({ path: path.join(outDir, "png", base + ".png") });
  await page.close();
  console.log("ok", base);
}
await browser.close();
