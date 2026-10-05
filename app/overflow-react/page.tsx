function Nested({ depth }: { depth: number }) {
  if (depth === 0) return null
  return (
    <div>
      <Nested depth={depth - 1} />
    </div>
  )
}

export default function Page() {
  // Deeply nested element tree: the stack overflow happens inside React's
  // server renderer, not in application code.
  return <Nested depth={100000} />
}
