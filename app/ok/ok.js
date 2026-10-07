'use client'

function Inner({ id, depth }) {
  if (depth > 0) return <Inner id={id} depth={depth - 1} />
  return <p>{id}</p>
}

export default function Ok({ id }) {
  return (
    <div>
      <Inner id={id} depth={20} />
    </div>
  )
}
