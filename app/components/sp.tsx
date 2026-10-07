'use client'
import { useSearchParams } from 'next/navigation'
export function SP() { const sp = useSearchParams(); return <span>{sp.get('q') ?? 'none'}</span> }
