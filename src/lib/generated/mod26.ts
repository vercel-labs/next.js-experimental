import 'server-only'

export const NAME_26 = 'mod26'

export function compute26(n: number): number {
  return n * 26 + NAME_26.length
}

export async function fetch26(): Promise<string> {
  return `mod26:${compute26(26)}`
}
