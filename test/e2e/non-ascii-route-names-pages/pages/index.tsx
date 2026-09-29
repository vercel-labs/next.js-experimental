import Link from 'next/link'

export default function Page() {
  return (
    <>
      <p id="home">home</p>
      <Link href="/пейдж" id="to-static">
        static
      </Link>
      <Link href="/статья/привет" id="to-ssg">
        ssg
      </Link>
      <Link href="/сервер/привет" id="to-ssr">
        ssr
      </Link>
    </>
  )
}
