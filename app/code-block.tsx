'use client'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'

export default function CodeBlock() {
  return (
    <div id="code">
      <SyntaxHighlighter language="js">{'const y = 2'}</SyntaxHighlighter>
    </div>
  )
}
