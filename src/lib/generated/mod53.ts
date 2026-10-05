import 'server-only'

export const NAME_53 = 'mod53'

export function compute53(n: number): number {
  return n * 53 + NAME_53.length
}

export async function fetch53(): Promise<string> {
  return `mod53:${compute53(53)}`
}
