'use client'

import { useActionState } from 'react'
import { greetBound } from '../actions'

export default function StableForm({ permalink }) {
  // Control: the action reference is stable (bound on the server module level).
  const [state, formAction] = useActionState(greetBound, null, permalink)
  return (
    <form action={formAction}>
      <input name="name" defaultValue="world" />
      <button type="submit">submit</button>
      <pre id="state">{JSON.stringify(state)}</pre>
    </form>
  )
}
