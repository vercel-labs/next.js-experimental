import 'server-only'

export const NAME_38 = 'mod38'

export function compute38(n: number): number {
  return n * 38 + NAME_38.length
}

export async function fetch38(): Promise<string> {
  return `mod38:${compute38(38)}`
}
