'use client'
import { useState } from 'react'
export function C_footer() {
  const [n, setN] = useState(0)
  return <div id="footer" onClick={() => setN(n + 1)}>footer:{n}</div>
}
