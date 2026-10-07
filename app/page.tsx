import { Suspense } from 'react';
import SearchClient from './search-client';

export default function Page() {
  return (
    <main>
      <h1>Search</h1>
      <Suspense fallback={<p id="fallback">loading search params…</p>}>
        <SearchClient />
      </Suspense>
    </main>
  );
}
