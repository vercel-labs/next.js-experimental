import 'server-only'

export const NAME_41 = 'mod41'

export function compute41(n: number): number {
  return n * 41 + NAME_41.length
}

export async function fetch41(): Promise<string> {
  return `mod41:${compute41(41)}`
}
