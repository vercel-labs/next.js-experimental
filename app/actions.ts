'use server'

export async function submit(boundArg: string, _prev: unknown, formData: FormData) {
  return { boundArg, name: String(formData.get('name') ?? '') }
}
