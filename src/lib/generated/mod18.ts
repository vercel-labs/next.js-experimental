import 'server-only'

export const NAME_18 = 'mod18'

export function compute18(n: number): number {
  return n * 18 + NAME_18.length
}

export async function fetch18(): Promise<string> {
  return `mod18:${compute18(18)}`
}
