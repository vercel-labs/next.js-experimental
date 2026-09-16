import { C_header } from './header'
import { C_sidebar } from './sidebar'
import { C_footer } from './footer'
import { C_counter } from './counter'
import { C_widgeta } from './widget-a'
import { C_widgetb } from './widget-b'
import { C_widgetc } from './widget-c'
import { C_widgetd } from './widget-d'

export default function Page() {
  return (
    <main>
      <h1>Flight Chunk Dedup Repro</h1>
      <C_header />
      <C_sidebar />
      <C_footer />
      <C_counter />
      <C_widgeta />
      <C_widgetb />
      <C_widgetc />
      <C_widgetd />
    </main>
  )
}
