import 'server-only'

export const NAME_12 = 'mod12'

export function compute12(n: number): number {
  return n * 12 + NAME_12.length
}

export async function fetch12(): Promise<string> {
  return `mod12:${compute12(12)}`
}
