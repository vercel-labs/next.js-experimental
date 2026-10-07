'use client'

// Simulates a data hook that throws during SSR without fallback data.
function useDataWithoutFallback(id) {
  if (typeof window === 'undefined') {
    throw new Error('No fallback data available during SSR for ' + id)
  }
  return { id }
}

function Inner({ id, depth }) {
  if (depth > 0) return <Inner id={id} depth={depth - 1} />
  const data = useDataWithoutFallback(id)
  return <p>{data.id}</p>
}

export default function Thrower({ id }) {
  return (
    <div>
      <Inner id={id} depth={20} />
    </div>
  )
}
