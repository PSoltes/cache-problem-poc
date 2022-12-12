import { AccessTokenError, Session } from '@auth0/nextjs-auth0'
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'

import { getSession } from 'src/utils/auth/auth0'

export type NextApiHandlerWithUser<T = never> = (
  req: NextApiRequest,
  res: NextApiResponse<T>,
  session: Session
) => void | Promise<void> | Promise<unknown>

interface WithApiAuth {
  <T>(callback: NextApiHandlerWithUser<T>): NextApiHandler
}

export const withApiAuth: WithApiAuth = (callback) => async (req, res) => {
  try {
    // const { accessToken } = await getAccessToken(req, res)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // req.accessToken = accessToken

    console.log('Got access token from token cache', {
      req,
      res,
    })
  } catch (err) {
    if (err instanceof Error) {
      if (err instanceof AccessTokenError) {
        res.status(401).json({
          error: err.code,
          description:
            'The user does not have an active session or is not authenticated',
        })

        return undefined
      }
      // @TODO - Not sure on the OPErrors, they stem from openid-client, used by nextjs-auth0 library.
      // For now they're downgraded. Check: https://energyaspects.atlassian.net/browse/WTW-1156
      if (err.name === 'OPError') {
        console.error(err, {
          req,
          res,
          level: 'warning',
        })
        res.status(401).json({
          error: 'not_authenticated',
          description:
            'The user does not have an active session or is not authenticated',
        })

        return undefined
      }

      if (err.name === 'TimeoutError') {
        console.error(err, {
          req,
          res,
          level: 'warning',
        })

        res.status(408).json({
          error: 'timeout',
          description: 'Connection timeout while fetching access token',
        })

        return undefined
      }
    }

    console.error(err, { req, res })

    res.status(500).json({
      error: 'internal server error',
      description: 'Internal server error while fetching access token',
    })

    return undefined
  }

  const session = await getSession(req, res)

  if (!session) {
    res.status(401).json({
      error: 'not_authenticated',
      description:
        'The user does not have an active session or is not authenticated',
    })

    return undefined
  }

  res.setHeader('Cache-Control', 'max-age=0, public, s-maxage=3600, stale-while-revalidate=43200')

  return callback(req, res, session)
}
