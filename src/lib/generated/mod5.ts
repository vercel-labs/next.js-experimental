import 'server-only'

export const NAME_5 = 'mod5'

export function compute5(n: number): number {
  return n * 5 + NAME_5.length
}

export async function fetch5(): Promise<string> {
  return `mod5:${compute5(5)}`
}
