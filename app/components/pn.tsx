'use client'
import { usePathname } from 'next/navigation'
export function PN() { const p = usePathname(); return <span>{p}</span> }
