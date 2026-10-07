import { promises as fs } from 'fs'
import path from 'path'

const FILE = path.join('/tmp', 'repro-db.txt')

export async function readValue(): Promise<string> {
  try {
    return await fs.readFile(FILE, 'utf8')
  } catch {
    return 'initial'
  }
}

export async function writeValue(value: string): Promise<void> {
  await fs.writeFile(FILE, value, 'utf8')
}
