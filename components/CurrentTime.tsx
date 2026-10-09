// @ts-expect-error - untyped local test package
import { Clock } from 'ui-lib'

export function CurrentTime() {
  return <Clock />
}
