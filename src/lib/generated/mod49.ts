import 'server-only'

export const NAME_49 = 'mod49'

export function compute49(n: number): number {
  return n * 49 + NAME_49.length
}

export async function fetch49(): Promise<string> {
  return `mod49:${compute49(49)}`
}
