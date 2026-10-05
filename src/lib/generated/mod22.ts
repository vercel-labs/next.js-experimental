import 'server-only'

export const NAME_22 = 'mod22'

export function compute22(n: number): number {
  return n * 22 + NAME_22.length
}

export async function fetch22(): Promise<string> {
  return `mod22:${compute22(22)}`
}
