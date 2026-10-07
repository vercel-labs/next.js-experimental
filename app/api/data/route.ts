export async function GET() {
  return Response.json({ markdown: '# hi\n\n```js\nconsole.log(1)\n```\n' })
}
