import { NextApiHandlerWithUser } from "src/utils/auth/withApiAuth"
import { getSession } from "utils/auth/auth0"

export const handlerWithHeaders: NextApiHandlerWithUser<any> = async (req, res): Promise<void> => {
  try {
    const resp = await fetch('https://api.punkapi.com/v2/beers')
    let data = {}
    if (resp.ok) {
      try {
        data = await resp.json()
      } catch (err) {
        data = { text: await resp.text() }
      }
    }
    // const session = await getSession(req, res)
    res.setHeader('Cache-Control', 'max-age=0, public, s-maxage=3600, stale-while-revalidate=43200')
    res.status(200).json(data)
    return
  } catch (err: unknown) {
    console.log(err)
    res.status(500).json({ message: 'Something went wrong' })
  }
}