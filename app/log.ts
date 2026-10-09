'use client'

// Shared, module-level log so both pages can append lifecycle events.
export const lifecycleLog: string[] = []
const listeners = new Set<() => void>()

export function log(entry: string) {
  lifecycleLog.push(`${lifecycleLog.length + 1}. ${entry}`)
  // eslint-disable-next-line no-console
  console.log('[repro]', entry)
  listeners.forEach((l) => l())
}

export function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function getSnapshot() {
  return lifecycleLog.length
}

// Module-level handle to the kept page's setState, so another page can set
// state on the kept (hidden but still mounted) page.
export const remote: { setMessage: null | ((v: string) => void) } = {
  setMessage: null,
}
