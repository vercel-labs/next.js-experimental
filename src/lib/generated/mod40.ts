import 'server-only'

export const NAME_40 = 'mod40'

export function compute40(n: number): number {
  return n * 40 + NAME_40.length
}

export async function fetch40(): Promise<string> {
  return `mod40:${compute40(40)}`
}
