import 'server-only'

export const NAME_36 = 'mod36'

export function compute36(n: number): number {
  return n * 36 + NAME_36.length
}

export async function fetch36(): Promise<string> {
  return `mod36:${compute36(36)}`
}
