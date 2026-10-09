'use client'

import Markdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { useEffect, useRef } from 'react'

const md = `# Hello\n\nSome *markdown* content.\n`

function Diagram() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    import('mermaid').then(async (m) => {
      m.default.initialize({ startOnLoad: false })
      const { svg } = await m.default.render('d1', 'graph TD; A-->B;')
      if (ref.current) ref.current.innerHTML = svg
    })
  }, [])
  return <div id="diagram" ref={ref} />
}

export default function MarkdownPanel() {
  return (
    <div id="panel">
      <Markdown>{md}</Markdown>
      <SyntaxHighlighter language="js">{'const y = 2'}</SyntaxHighlighter>
      <Diagram />
    </div>
  )
}
