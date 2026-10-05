import Link from 'next/link'

export default function Page() {
  return (
    <>
      <p id="home">home</p>
      <Link href="/тест" id="to-static">
        static
      </Link>
      <Link href="/тест/вложенная" id="to-nested">
        nested
      </Link>
      <Link href="/блог/hello" id="to-dynamic">
        dynamic
      </Link>
      <Link href="/каталог/one/two" id="to-catch-all">
        catch all
      </Link>
    </>
  )
}
