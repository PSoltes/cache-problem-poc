import { NextRequest, NextResponse } from 'next/server'


export const middleware = async (request: NextRequest) => {
  try {
    const resp = NextResponse.next()

    resp.headers.set(
      'Cache-Control',
      'max-age=0, public, s-maxage=3600, stale-while-revalidate=43200'
    )

    return resp
  } catch (err) {
    console.error(err, {
      message: 'Error logging user session data. Continued without.',
      request,
    })

    return NextResponse.next()
  }
}
