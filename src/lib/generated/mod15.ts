import 'server-only'

export const NAME_15 = 'mod15'

export function compute15(n: number): number {
  return n * 15 + NAME_15.length
}

export async function fetch15(): Promise<string> {
  return `mod15:${compute15(15)}`
}
