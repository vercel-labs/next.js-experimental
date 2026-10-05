import 'server-only'

export const NAME_8 = 'mod8'

export function compute8(n: number): number {
  return n * 8 + NAME_8.length
}

export async function fetch8(): Promise<string> {
  return `mod8:${compute8(8)}`
}
