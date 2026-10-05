import 'server-only'

export const NAME_19 = 'mod19'

export function compute19(n: number): number {
  return n * 19 + NAME_19.length
}

export async function fetch19(): Promise<string> {
  return `mod19:${compute19(19)}`
}
