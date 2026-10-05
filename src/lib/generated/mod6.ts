import 'server-only'

export const NAME_6 = 'mod6'

export function compute6(n: number): number {
  return n * 6 + NAME_6.length
}

export async function fetch6(): Promise<string> {
  return `mod6:${compute6(6)}`
}
