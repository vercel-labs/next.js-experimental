import 'server-only'

export const NAME_20 = 'mod20'

export function compute20(n: number): number {
  return n * 20 + NAME_20.length
}

export async function fetch20(): Promise<string> {
  return `mod20:${compute20(20)}`
}
