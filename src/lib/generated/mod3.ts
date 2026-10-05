import 'server-only'

export const NAME_3 = 'mod3'

export function compute3(n: number): number {
  return n * 3 + NAME_3.length
}

export async function fetch3(): Promise<string> {
  return `mod3:${compute3(3)}`
}
