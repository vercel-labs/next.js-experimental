import 'server-only'

export const NAME_33 = 'mod33'

export function compute33(n: number): number {
  return n * 33 + NAME_33.length
}

export async function fetch33(): Promise<string> {
  return `mod33:${compute33(33)}`
}
