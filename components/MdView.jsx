'use client'
import { Streamdown } from 'streamdown'
const md = '# Title\n\n```js\nconsole.log(1)\n```\n\n```mermaid\ngraph TD; A-->B;\n```\n'
export default function MdView({ id }) { return <div>md {id}<Streamdown>{md}</Streamdown></div> }
