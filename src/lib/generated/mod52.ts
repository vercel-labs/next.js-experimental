import 'server-only'

export const NAME_52 = 'mod52'

export function compute52(n: number): number {
  return n * 52 + NAME_52.length
}

export async function fetch52(): Promise<string> {
  return `mod52:${compute52(52)}`
}
