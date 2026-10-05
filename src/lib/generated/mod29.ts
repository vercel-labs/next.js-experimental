import 'server-only'

export const NAME_29 = 'mod29'

export function compute29(n: number): number {
  return n * 29 + NAME_29.length
}

export async function fetch29(): Promise<string> {
  return `mod29:${compute29(29)}`
}
