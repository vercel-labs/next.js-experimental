import 'server-only'

export type User = { id: string; name: string }

export async function getUsers(): Promise<User[]> {
  return [{ id: 'u1', name: 'Ada' }]
}
