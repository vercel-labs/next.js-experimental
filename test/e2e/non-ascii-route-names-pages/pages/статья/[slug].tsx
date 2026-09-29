import type { GetStaticPaths, GetStaticProps } from 'next'

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [{ params: { slug: 'привет' } }, { params: { slug: 'hello' } }],
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = ({ params }) => {
  return { props: { slug: params!.slug as string } }
}

export default function Page({ slug }: { slug: string }) {
  return <p id="ssg">статья: {slug}</p>
}
