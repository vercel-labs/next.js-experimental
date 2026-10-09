import { connection } from 'next/server'

export async function GET() {
  await connection()
  // The code frame for this error includes the long line below, so its width depends on the terminal.
  const error = new Error('logged from a route handler, the code frame should fit the current terminal width')
  console.error(error)
  return new Response('logged an error, check the terminal running next dev')
}
