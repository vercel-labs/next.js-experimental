import { revalidateTag } from 'next/cache'
import { writeValue } from '../../../lib/db'

// Mirrors an SDK route handler that returns an SSE Response before its
// asynchronous mutation (and the revalidateTag call in the tool callback)
// has completed.
export async function GET(request: Request) {
  const value = new URL(request.url).searchParams.get('value') ?? 'mutated'

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder()
      controller.enqueue(enc.encode('event: start\ndata: {}\n\n'))

      // async "tool call" mutation, resolves after the Response was returned
      await new Promise((r) => setTimeout(r, 200))
      await writeValue(value)

      try {
        revalidateTag('data', { expire: 0 })
        controller.enqueue(enc.encode('event: revalidated\ndata: {"ok":true}\n\n'))
      } catch (err) {
        controller.enqueue(
          enc.encode(
            `event: error\ndata: ${JSON.stringify({ message: String(err) })}\n\n`
          )
        )
      }

      controller.enqueue(enc.encode('event: done\ndata: {}\n\n'))
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream',
      'cache-control': 'no-store',
    },
  })
}
