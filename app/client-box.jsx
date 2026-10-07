'use client'
import { Activity, useState } from 'react'
export default function ClientBox({ label, children }) {
  const [n, setN] = useState(0)
  return (
    <div id={`box-${label}`} className="box">
      <button onClick={() => setN(n + 1)}>count {n}</button>
      <Activity mode="hidden">
        <div id={`hidden-${label}`}>hidden activity content {label}</div>
      </Activity>
      {children}
    </div>
  )
}
