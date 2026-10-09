'use client'

import { useActionState } from 'react'
import { submit } from './actions'

export function Form({ arg }: { arg: string }) {
  // action is bound during render -> new bound action reference each render
  const [state, formAction] = useActionState(submit.bind(null, arg), null, '/permalink')
  return (
    <form action={formAction}>
      <input name="name" defaultValue="world" />
      <button type="submit">submit</button>
      <pre id="state">{JSON.stringify(state)}</pre>
    </form>
  )
}
