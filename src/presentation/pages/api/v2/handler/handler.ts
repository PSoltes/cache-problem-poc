import { NextApiHandler } from "next/types"

export const handler: NextApiHandler = async (req, res): Promise<void> => {
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

    res.status(200).json(data)
    return
  } catch (err: unknown) {
    res.status(500).json({ message: 'Something went wrong' })
  }
}