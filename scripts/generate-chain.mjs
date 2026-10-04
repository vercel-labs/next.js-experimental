// Generates a deep chain of shared (non-"use client") App Router modules:
// lib/chain/mod0 -> mod1 -> ... -> mod1999 (leaf component).
// This stands in for a large app whose page pulls in a deep tree of shared modules.
import fs from 'node:fs';
import path from 'node:path';

const N = Number(process.env.CHAIN_DEPTH ?? 2000);
const dir = path.join(process.cwd(), 'lib', 'chain');
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });

for (let i = 0; i < N; i++) {
  const file = path.join(dir, `mod${i}.js`);
  if (i === N - 1) {
    fs.writeFileSync(
      file,
      `export const depth = ${i};\nexport default function Leaf() {\n  return <span id="leaf">leaf depth ${i}</span>;\n}\n`
    );
  } else {
    fs.writeFileSync(
      file,
      `import Next, { depth as d } from "./mod${i + 1}";\nexport const depth = d;\nexport default function M${i}(props) {\n  return <Next {...props} />;\n}\n`
    );
  }
}
console.log(`generated ${N} chained modules in lib/chain`);
