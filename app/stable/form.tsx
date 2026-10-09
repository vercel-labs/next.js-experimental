'use client'

import { useActionState } from 'react'
import { submit } from '../actions'

// CONTROL: bound action created once at module scope (stable reference)
const stableAction = submit.bind(null, 'bound-value')

export function StableForm() {
  const [state, formAction] = useActionState(stableAction, null, '/stable')
  return (
    <form action={formAction}>
      <input name="name" defaultValue="world" />
      <button type="submit">submit</button>
      <pre id="state">{JSON.stringify(state)}</pre>
    </form>
  )
}
