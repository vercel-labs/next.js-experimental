import { ViewTransition } from 'react'

export default function Destination() {
  return (
    <ViewTransition name="repro-card">
      <main data-page="destination">
        <h1>Destination</h1>
        <p>The hidden-tab navigation completed.</p>
      </main>
    </ViewTransition>
  )
}
