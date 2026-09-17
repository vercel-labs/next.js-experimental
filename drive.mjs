// Starts `next dev` on a fresh .next, warms routes in the given order, prints the dev server's own
// RSS (the process listening on the port) after each group. Usage: node drive.mjs pages-first|handlers-first
import { spawn, execSync } from "node:child_process";
const order = process.argv[2] ?? "pages-first"; const port = +(process.env.PORT ?? 3999);
const pid = () => { try { return execSync(`lsof -ti tcp:${port} -sTCP:LISTEN`).toString().trim().split("\n")[0]; } catch { return ""; } };
const rss = () => { const p = pid(); if (!p) return "?"; try { return Math.round(+execSync(`ps -o rss= -p ${p}`).toString().trim() / 1024) + " MB"; } catch { return "?"; } };
execSync("rm -rf .next");
const dev = spawn("npx", ["next", "dev", "-p", String(port)], { stdio: ["ignore", "pipe", "pipe"] });
const base = `http://localhost:${port}`;
let up = false; for (let i = 0; i < 12; i++) { try { await fetch(base + "/p1", { signal: AbortSignal.timeout(10_000) }); up = true; break; } catch { await new Promise((r) => setTimeout(r, 1000)); } }
if (!up) { console.log("[repro] ERROR dev server never answered"); dev.kill("SIGKILL"); process.exit(3); }
console.log(`[repro] ready; order=${order}; server pid=${pid()} rss=${rss()}`);
const count = (glob) => +execSync(`ls -d ${glob} 2>/dev/null | wc -l`).toString().trim();
const pages = Array.from({ length: count("app/p*") }, (_, i) => `/p${i + 1}`);
const handlers = Array.from({ length: count("app/api/h*") }, (_, i) => `/api/h${i + 1}`);
const warm = async (label, urls) => { const t = Date.now(); let i = 0; for (const u of urls) { try { await fetch(base + u, { signal: AbortSignal.timeout(90_000) }); } catch (e) { console.log(`[repro] ERROR ${u}: ${e.message}`); dev.kill("SIGKILL"); process.exit(3); } if (++i % 10 === 0) console.log(`[repro] ${label} ${i}/${urls.length} rss=${rss()}`); } console.log(`[repro] ${label} done: ${urls.length} in ${((Date.now() - t) / 1000).toFixed(1)}s rss=${rss()}`); };
if (order === "pages-first") { await warm("pages", pages); await warm("handlers", handlers); } else { await warm("handlers", handlers); await warm("pages", pages); }
console.log(`[repro] final rss=${rss()}`);
dev.kill("SIGTERM"); setTimeout(() => process.exit(0), 1500);
