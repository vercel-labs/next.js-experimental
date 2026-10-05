export function getServerSideProps({ params }) {
  return { props: { slug: params.slug } }
}

export default function Page({ slug }) {
  return <p id="pages-dynamic">статья: {slug}</p>
}
