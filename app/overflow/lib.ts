export function recurse(n: number): number {
  // deliberate infinite recursion in application code
  return recurse(n + 1)
}
