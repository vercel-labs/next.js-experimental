import { Counter } from "./Counter";

// Fully static page: prerendered at build time, never revalidated.
export default function Home() {
  return (
    <main>
      <h1>Build v1</h1>
      <Counter />
    </main>
  );
}
