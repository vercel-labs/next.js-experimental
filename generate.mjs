// Generates ROUTES routes x COMPONENTS components, every component importing from 'fake-macro'.
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';

const ROUTES = Number(process.env.ROUTES ?? 30);
const COMPONENTS = Number(process.env.COMPONENTS ?? 10);
const ROWS = 40;

rmSync('app', { recursive: true, force: true });
mkdirSync('app', { recursive: true });
writeFileSync(
  'app/layout.tsx',
  `export default function RootLayout({ children }: { children: React.ReactNode }) {\n  return (\n    <html lang="en">\n      <body>{children}</body>\n    </html>\n  );\n}\n`,
);
writeFileSync('fake-macro.d.ts', `declare module 'fake-macro' {\n  export function m(text: string): string;\n}\n`);

for (let r = 0; r < ROUTES; r++) {
  const dir = `app/route-${r}`;
  mkdirSync(`${dir}/_components`, { recursive: true });
  const names = [];
  for (let c = 0; c < COMPONENTS; c++) {
    const name = `C${r}x${c}`;
    const rows = Array.from(
      { length: ROWS },
      (_, i) =>
        `      <li key="${i}" className="row-${i}">\n        <span>{m("route ${r} component ${c} item ${i}")}</span>\n        <b>{props.n * ${i}}</b>\n      </li>`,
    ).join('\n');
    writeFileSync(
      `${dir}/_components/${name}.tsx`,
      `import { m } from "fake-macro";\n\nexport function ${name}(props: { n: number }) {\n  return (\n    <ul title={m("title ${r}-${c}")}>\n${rows}\n    </ul>\n  );\n}\n`,
    );
    names.push(name);
  }
  writeFileSync(
    `${dir}/page.tsx`,
    `${names.map((n) => `import { ${n} } from "./_components/${n}";`).join('\n')}\n\nexport default function Page() {\n  return (\n    <main>\n${names.map((n, i) => `      <${n} n={${i}} />`).join('\n')}\n    </main>\n  );\n}\n`,
  );
}
console.log(`generated ${ROUTES} routes x ${COMPONENTS} components`);
