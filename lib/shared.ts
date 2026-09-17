import "server-only";
import { cookies, headers } from "next/headers";
export async function who() { const c = await cookies(); const h = await headers(); return `${c.size}:${h.get("host") ?? ""}`; }
export const table = Array.from({ length: 2000 }, (_, i) => ({ id: i, label: `row ${i}`, tags: ["a", "b", "c"].map((t) => t + i) }));
