import 'server-only'

export function dbName(): string {
  return 'variant-barrel-db'
}

export async function query<T>(rows: T[]): Promise<T[]> {
  return rows
}
