// @ts-expect-error - untyped third-party package
import { LibClock } from 'time-lib'

export function Clock() {
  // This user component renders a third-party component that reads the time.
  return <LibClock />
}
