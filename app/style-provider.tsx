'use client'

// Mirrors @ant-design/nextjs-registry's AntdRegistry: the client style provider
// creates a per-render cache id with Math.random() inside useState.
import { createCache } from '@ant-design/cssinjs'
import { useState } from 'react'

export function StyleProvider({ children }: { children: React.ReactNode }) {
  const [cache] = useState(() => createCache())
  return <div data-cssinjs-instance={String(Boolean(cache))}>{children}</div>
}
