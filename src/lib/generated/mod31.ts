import 'server-only'

export const NAME_31 = 'mod31'

export function compute31(n: number): number {
  return n * 31 + NAME_31.length
}

export async function fetch31(): Promise<string> {
  return `mod31:${compute31(31)}`
}
