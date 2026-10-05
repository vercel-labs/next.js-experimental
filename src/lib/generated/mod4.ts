import 'server-only'

export const NAME_4 = 'mod4'

export function compute4(n: number): number {
  return n * 4 + NAME_4.length
}

export async function fetch4(): Promise<string> {
  return `mod4:${compute4(4)}`
}
