import 'server-only'

export const NAME_35 = 'mod35'

export function compute35(n: number): number {
  return n * 35 + NAME_35.length
}

export async function fetch35(): Promise<string> {
  return `mod35:${compute35(35)}`
}
