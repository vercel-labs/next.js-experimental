import { Suspense } from 'react';
import SearchParamsReader from './search-params';

export default function Page() {
  return (
    <main>
      <h1>Static page</h1>
      <Suspense fallback={null}>
        <SearchParamsReader />
      </Suspense>
    </main>
  );
}
