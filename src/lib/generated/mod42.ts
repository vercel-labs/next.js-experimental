import 'server-only'

export const NAME_42 = 'mod42'

export function compute42(n: number): number {
  return n * 42 + NAME_42.length
}

export async function fetch42(): Promise<string> {
  return `mod42:${compute42(42)}`
}
