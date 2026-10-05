import 'server-only'

export const NAME_25 = 'mod25'

export function compute25(n: number): number {
  return n * 25 + NAME_25.length
}

export async function fetch25(): Promise<string> {
  return `mod25:${compute25(25)}`
}
