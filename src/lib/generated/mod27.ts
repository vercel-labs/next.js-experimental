import 'server-only'

export const NAME_27 = 'mod27'

export function compute27(n: number): number {
  return n * 27 + NAME_27.length
}

export async function fetch27(): Promise<string> {
  return `mod27:${compute27(27)}`
}
