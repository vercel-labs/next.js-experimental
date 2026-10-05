import 'server-only'

export const NAME_14 = 'mod14'

export function compute14(n: number): number {
  return n * 14 + NAME_14.length
}

export async function fetch14(): Promise<string> {
  return `mod14:${compute14(14)}`
}
