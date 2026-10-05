import 'server-only'

export const NAME_11 = 'mod11'

export function compute11(n: number): number {
  return n * 11 + NAME_11.length
}

export async function fetch11(): Promise<string> {
  return `mod11:${compute11(11)}`
}
