'use client'

import { remote, log } from '../log'

export default function OtherPage() {
  return (
    <main>
      <h1>other page</h1>
      <button
        id="set-remote"
        onClick={() => {
          log('other: setting message on the hidden kept page')
          remote.setMessage?.('message set while hidden')
        }}
      >
        set message on hidden /kept page
      </button>
    </main>
  )
}
