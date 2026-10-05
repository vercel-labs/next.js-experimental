import 'server-only'

export const NAME_51 = 'mod51'

export function compute51(n: number): number {
  return n * 51 + NAME_51.length
}

export async function fetch51(): Promise<string> {
  return `mod51:${compute51(51)}`
}
