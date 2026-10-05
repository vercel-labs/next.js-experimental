import 'server-only'

export const NAME_16 = 'mod16'

export function compute16(n: number): number {
  return n * 16 + NAME_16.length
}

export async function fetch16(): Promise<string> {
  return `mod16:${compute16(16)}`
}
