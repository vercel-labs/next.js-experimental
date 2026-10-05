import 'server-only'

export const NAME_45 = 'mod45'

export function compute45(n: number): number {
  return n * 45 + NAME_45.length
}

export async function fetch45(): Promise<string> {
  return `mod45:${compute45(45)}`
}
