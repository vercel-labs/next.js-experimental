import 'server-only'

export const NAME_28 = 'mod28'

export function compute28(n: number): number {
  return n * 28 + NAME_28.length
}

export async function fetch28(): Promise<string> {
  return `mod28:${compute28(28)}`
}
