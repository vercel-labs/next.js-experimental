'use server'

export async function greet(boundArg, prevState, formData) {
  return { boundArg, name: formData.get('name') ?? null, at: Date.now() }
}

export async function greetBound(prevState, formData) {
  return { boundArg: 'bound-arg', name: formData.get('name') ?? null, at: Date.now() }
}
