import 'server-only'

export const NAME_13 = 'mod13'

export function compute13(n: number): number {
  return n * 13 + NAME_13.length
}

export async function fetch13(): Promise<string> {
  return `mod13:${compute13(13)}`
}
