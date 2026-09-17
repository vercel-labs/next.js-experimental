// Generates app/p1..pN/page.tsx and app/api/h1..hM/route.ts. Flags: PAGES, HANDLERS (counts),
// HANDLER_IMPORT=0 makes the handlers import nothing, PAGE_IMPORT=0 makes the pages import nothing.
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
const N = +(process.env.PAGES ?? 50), M = +(process.env.HANDLERS ?? 34);
const hi = process.env.HANDLER_IMPORT !== "0", pi = process.env.PAGE_IMPORT !== "0";
for (const d of ["app/api"]) rmSync(d, { recursive: true, force: true });
for (let i = 1; i <= 200; i++) rmSync(`app/p${i}`, { recursive: true, force: true });
for (let i = 1; i <= N; i++) {
  mkdirSync(`app/p${i}`, { recursive: true });
  writeFileSync(`app/p${i}/page.tsx`, pi
    ? `import { who, table } from "@/lib/shared";\nexport const dynamic = "force-dynamic";\nexport default async function Page() { const w = await who(); return <main><h1>page ${i} {w}</h1><ul>{table.slice(0, 20).map((r) => <li key={r.id}>{r.label}</li>)}</ul></main>; }\n`
    : `export const dynamic = "force-dynamic";\nexport default function Page() { return <main><h1>page ${i}</h1></main>; }\n`);
}
for (let i = 1; i <= M; i++) {
  mkdirSync(`app/api/h${i}`, { recursive: true });
  writeFileSync(`app/api/h${i}/route.ts`, hi
    ? `import { NextResponse } from "next/server";\nimport { who, table } from "@/lib/shared";\nexport async function GET() { return NextResponse.json({ h: ${i}, w: await who(), n: table.length }); }\n`
    : `export function GET() { return Response.json({ h: ${i} }); }\n`);
}
console.log(`[gen] ${N} pages (imports=${pi}) + ${M} handlers (imports=${hi})`);
