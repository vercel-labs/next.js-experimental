import 'server-only'

export const NAME_34 = 'mod34'

export function compute34(n: number): number {
  return n * 34 + NAME_34.length
}

export async function fetch34(): Promise<string> {
  return `mod34:${compute34(34)}`
}
