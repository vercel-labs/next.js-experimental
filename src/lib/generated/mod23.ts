import 'server-only'

export const NAME_23 = 'mod23'

export function compute23(n: number): number {
  return n * 23 + NAME_23.length
}

export async function fetch23(): Promise<string> {
  return `mod23:${compute23(23)}`
}
