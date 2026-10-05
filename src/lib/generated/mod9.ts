import 'server-only'

export const NAME_9 = 'mod9'

export function compute9(n: number): number {
  return n * 9 + NAME_9.length
}

export async function fetch9(): Promise<string> {
  return `mod9:${compute9(9)}`
}
