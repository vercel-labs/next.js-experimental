import 'server-only'

export const NAME_48 = 'mod48'

export function compute48(n: number): number {
  return n * 48 + NAME_48.length
}

export async function fetch48(): Promise<string> {
  return `mod48:${compute48(48)}`
}
