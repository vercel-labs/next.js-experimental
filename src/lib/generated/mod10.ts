import 'server-only'

export const NAME_10 = 'mod10'

export function compute10(n: number): number {
  return n * 10 + NAME_10.length
}

export async function fetch10(): Promise<string> {
  return `mod10:${compute10(10)}`
}
