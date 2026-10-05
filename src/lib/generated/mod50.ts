import 'server-only'

export const NAME_50 = 'mod50'

export function compute50(n: number): number {
  return n * 50 + NAME_50.length
}

export async function fetch50(): Promise<string> {
  return `mod50:${compute50(50)}`
}
