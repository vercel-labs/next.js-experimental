import 'server-only'

export const NAME_17 = 'mod17'

export function compute17(n: number): number {
  return n * 17 + NAME_17.length
}

export async function fetch17(): Promise<string> {
  return `mod17:${compute17(17)}`
}
