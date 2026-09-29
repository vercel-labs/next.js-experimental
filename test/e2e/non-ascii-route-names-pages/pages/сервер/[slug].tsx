import type { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = ({ params }) => {
  return Promise.resolve({ props: { slug: params!.slug as string } })
}

export default function Page({ slug }: { slug: string }) {
  return <p id="ssr">сервер: {slug}</p>
}
