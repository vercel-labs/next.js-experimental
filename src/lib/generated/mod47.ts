import 'server-only'

export const NAME_47 = 'mod47'

export function compute47(n: number): number {
  return n * 47 + NAME_47.length
}

export async function fetch47(): Promise<string> {
  return `mod47:${compute47(47)}`
}
