import { shared } from './shared'
export default function Heavy() {
  return <div id="heavy">heavy {shared.length}</div>
}
