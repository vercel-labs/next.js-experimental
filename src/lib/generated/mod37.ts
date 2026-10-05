import 'server-only'

export const NAME_37 = 'mod37'

export function compute37(n: number): number {
  return n * 37 + NAME_37.length
}

export async function fetch37(): Promise<string> {
  return `mod37:${compute37(37)}`
}
