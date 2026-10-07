'use client'
import { useState } from 'react'
import { runInWorker } from '../lib/work.js'

export default function Client() {
  const [n, setN] = useState(0)
  return <button onClick={() => { runInWorker(21); setN(n + 1) }}>run {n}</button>
}
