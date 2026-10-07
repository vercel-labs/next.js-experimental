import ClientBox from './client-box'
export default async function Slow({ label }) {
  await new Promise((r) => setTimeout(r, 4000))
  return <ClientBox label={label}><p>streamed {label}</p></ClientBox>
}
