import 'server-only'

export const NAME_43 = 'mod43'

export function compute43(n: number): number {
  return n * 43 + NAME_43.length
}

export async function fetch43(): Promise<string> {
  return `mod43:${compute43(43)}`
}
