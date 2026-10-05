import 'server-only'

export const NAME_32 = 'mod32'

export function compute32(n: number): number {
  return n * 32 + NAME_32.length
}

export async function fetch32(): Promise<string> {
  return `mod32:${compute32(32)}`
}
