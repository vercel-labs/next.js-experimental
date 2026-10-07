'use client';
import { useSearchParams } from 'next/navigation';

export default function SearchParamsReader() {
  const searchParams = useSearchParams();
  return <p>q = {searchParams.get('q') ?? 'none'}</p>;
}
