/**
 * Route definitions hold the decoded form of a pathname, because that's how
 * pages are named on the filesystem: `app/тест/page.tsx` is the route `/тест`.
 * Requests carry the percent-encoded form instead (`/%D1%82%D0%B5%D1%81%D1%82`),
 * and so does the matched path header that external routers send in minimal
 * mode. This converts a request pathname into the form route definitions are
 * keyed by.
 *
 * Every segment is decoded on its own, and a segment that decodes to something
 * containing a path separator is left encoded, so an encoded separator can
 * never change the shape of the pathname.
 */
export function decodeRoutePathname(pathname: string): string {
  // Fast path: without a percent there is nothing to decode.
  if (!pathname.includes('%')) return pathname

  let changed = false

  const segments = pathname.split('/').map((segment) => {
    if (!segment.includes('%')) return segment

    let decoded: string
    try {
      decoded = decodeURIComponent(segment)
    } catch {
      // An improperly encoded segment can only match in its raw form.
      return segment
    }

    if (
      decoded === segment ||
      decoded.includes('/') ||
      decoded.includes('\\')
    ) {
      return segment
    }

    changed = true
    return decoded
  })

  return changed ? segments.join('/') : pathname
}

/**
 * Header values can only carry Latin1 characters, so a pathname that is put in
 * a header (such as `x-nextjs-matched-path`) has to have its non-ASCII
 * characters percent-encoded first. Reserved characters are left alone, so a
 * route pattern such as `/блог/[slug]` keeps its brackets and stays
 * recognizable as a dynamic route.
 */
export function encodeRoutePathnameForHeader(pathname: string): string {
  // eslint-disable-next-line no-control-regex
  return pathname.replace(/[^\u0000-\u007F]+/g, (part) =>
    encodeURIComponent(part)
  )
}
