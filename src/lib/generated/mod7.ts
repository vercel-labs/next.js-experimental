import 'server-only'

export const NAME_7 = 'mod7'

export function compute7(n: number): number {
  return n * 7 + NAME_7.length
}

export async function fetch7(): Promise<string> {
  return `mod7:${compute7(7)}`
}
