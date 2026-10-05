import 'server-only'

export const NAME_1 = 'mod1'

export function compute1(n: number): number {
  return n * 1 + NAME_1.length
}

export async function fetch1(): Promise<string> {
  return `mod1:${compute1(1)}`
}
