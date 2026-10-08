import * as gen from '../gen'

export function lib() {
  return Object.keys(gen).length + '-v1'
}
