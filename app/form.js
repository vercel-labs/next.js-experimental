'use client'

import { useActionState } from 'react'
import { greet } from './actions'

export default function Form({ permalink }) {
  // The action is bound during render, so a new bound reference (and a new
  // bound-args promise) is created on every render.
  const [state, formAction] = useActionState(
    greet.bind(null, 'bound-arg'),
    null,
    permalink
  )
  return (
    <form action={formAction}>
      <input name="name" defaultValue="world" />
      <button type="submit">submit</button>
      <pre id="state">{JSON.stringify(state)}</pre>
    </form>
  )
}
