'use client'

import { Streamdown } from 'streamdown'
import 'streamdown/styles.css'

const content = `# deferred markdown

Some text with inline code \`const a = 1\`.

\`\`\`ts
const answer: number = 42
console.log(answer)
\`\`\`

\`\`\`mermaid
graph TD;
  A-->B;
  B-->C;
\`\`\`
`

const mermaidPlugin = {
  name: 'mermaid' as const,
  type: 'diagram' as const,
  language: 'mermaid',
  getMermaid() {
    return {
      initialize() {},
      async render(id: string, source: string) {
        const { default: mermaid } = await import('mermaid')
        mermaid.initialize({ startOnLoad: false, suppressErrorRendering: true })
        return mermaid.render(id, source)
      },
    }
  },
}

export default function Markdown({ source = content }: { source?: string }) {
  return (
    <div className="markdown">
      <Streamdown mode="static" plugins={{ mermaid: mermaidPlugin }}>
        {source}
      </Streamdown>
    </div>
  )
}
