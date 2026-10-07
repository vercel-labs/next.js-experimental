'use client';

import { useSearchParams } from 'next/navigation';

export default function SearchClient() {
  const searchParams = useSearchParams();
  return <p id="q">q: {searchParams.get('q') ?? 'none'}</p>;
}
