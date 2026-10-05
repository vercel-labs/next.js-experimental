import 'server-only'

export const NAME_21 = 'mod21'

export function compute21(n: number): number {
  return n * 21 + NAME_21.length
}

export async function fetch21(): Promise<string> {
  return `mod21:${compute21(21)}`
}
