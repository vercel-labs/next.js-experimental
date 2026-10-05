import 'server-only'

export type Item = { id: string; title: string }

export async function getItems(): Promise<Item[]> { return [{ id: '1', title: 'One' }] }

export async function getItem(id: string): Promise<Item> { return { id, title: `Item ${id}` } }

export function newFn231(): string { return 'NEW231' }
