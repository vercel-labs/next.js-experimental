import 'server-only'

export const NAME_2 = 'mod2'

export function compute2(n: number): number {
  return n * 2 + NAME_2.length
}

export async function fetch2(): Promise<string> {
  return `mod2:${compute2(2)}`
}
