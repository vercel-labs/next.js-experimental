'use server'
export async function ping() {
  return { ok: true, at: Date.now() }
}
