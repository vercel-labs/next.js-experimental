import 'server-only'

export const NAME_24 = 'mod24'

export function compute24(n: number): number {
  return n * 24 + NAME_24.length
}

export async function fetch24(): Promise<string> {
  return `mod24:${compute24(24)}`
}
