import 'server-only'

export const NAME_30 = 'mod30'

export function compute30(n: number): number {
  return n * 30 + NAME_30.length
}

export async function fetch30(): Promise<string> {
  return `mod30:${compute30(30)}`
}
