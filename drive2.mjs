// Linux variant of drive.mjs: uses /proc instead of lsof/ps, prints RSS after EVERY route.
import { spawn, execSync } from "node:child_process";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
const order = process.argv[2] ?? "pages-first";
const port = +(process.env.PORT ?? 3999);
const log = process.env.LOG ?? "/tmp/next-dev.log";
execSync("rm -rf .next");
const out = (await import("node:fs")).openSync(log, "w");
const dev = spawn("npx", ["next", "dev", "-p", String(port)], { stdio: ["ignore", out, out] });
const tree = (root) => {
  const all = readdirSync("/proc").filter((d) => /^\d+$/.test(d));
  const par = {};
  for (const p of all) { try { const s = readFileSync(`/proc/${p}/stat`, "utf8"); par[p] = s.slice(s.lastIndexOf(")") + 2).split(" ")[1]; } catch {} }
  const set = new Set([String(root)]);
  let changed = true;
  while (changed) { changed = false; for (const p of all) if (!set.has(p) && set.has(par[p])) { set.add(p); changed = true; } }
  return [...set];
};
const rssOf = (p) => { try { return +readFileSync(`/proc/${p}/statm`, "utf8").split(" ")[1] * 4096 / 1048576; } catch { return 0; } };
const rss = () => {
  let total = 0, biggest = 0;
  for (const p of tree(dev.pid)) { const r = rssOf(p); total += r; if (r > biggest) biggest = r; }
  return { total: Math.round(total), biggest: Math.round(biggest) };
};
const base = `http://localhost:${port}`;
let up = false;
for (let i = 0; i < 40; i++) { try { await fetch(base + "/p1", { signal: AbortSignal.timeout(20_000) }); up = true; break; } catch { await new Promise((r) => setTimeout(r, 1000)); } }
if (!up) { console.log("[repro] ERROR dev server never answered"); dev.kill("SIGKILL"); process.exit(3); }
console.log(`[repro] ready; order=${order}; rss=${JSON.stringify(rss())}`);
const count = (glob) => +execSync(`ls -d ${glob} 2>/dev/null | wc -l`).toString().trim();
const pages = Array.from({ length: count("app/p*") }, (_, i) => `/p${i + 1}`);
const handlers = Array.from({ length: count("app/api/h*") }, (_, i) => `/api/h${i + 1}`);
const warm = async (label, urls) => {
  let prev = rss().total;
  for (const u of urls) {
    try { await fetch(base + u, { signal: AbortSignal.timeout(120_000) }); }
    catch (e) { console.log(`[repro] ERROR ${u}: ${e.message}`); dev.kill("SIGKILL"); process.exit(3); }
    const r = rss();
    console.log(`[repro] ${label} ${u} rss_total=${r.total} MB (delta ${r.total - prev} MB) biggest_proc=${r.biggest} MB`);
    prev = r.total;
  }
};
if (order === "pages-first") { await warm("pages", pages); await warm("handlers", handlers); }
else { await warm("handlers", handlers); await warm("pages", pages); }
console.log(`[repro] final rss=${JSON.stringify(rss())}`);
for (const p of tree(dev.pid)) { try { process.kill(+p, "SIGKILL"); } catch {} }
setTimeout(() => process.exit(0), 1000);
