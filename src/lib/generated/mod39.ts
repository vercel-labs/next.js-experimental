import 'server-only'

export const NAME_39 = 'mod39'

export function compute39(n: number): number {
  return n * 39 + NAME_39.length
}

export async function fetch39(): Promise<string> {
  return `mod39:${compute39(39)}`
}
