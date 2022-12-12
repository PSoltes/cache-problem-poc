import { CookieSerializeOptions } from 'next/dist/server/web/types'

import config from 'config'

interface Auth0Config {
  clockTolerance: number
  issuerBaseURL?: string
  baseURL: string
  clientID: string
  clientSecret?: string
  httpTimeout: number
  authorizationParams: {
    scope: string
    audience?: string
  }
  routes: {
    callback?: string
    postLogoutRedirect: string
  }
  secret?: string
  session: {
    cookie: CookieSerializeOptions & { transient?: boolean }
    name: string
    rollingDuration: number
    absoluteDuration: boolean | number
    rolling?: boolean
  }
}

export const auth0Configs: Auth0Config = {
  clockTolerance: 60,
  issuerBaseURL: config.AUTH0_ISSUER_BASE_URL,
  baseURL: config.APP_URL,
  clientID: config.AUTH0_CLIENT_ID,
  clientSecret: config.AUTH0_CLIENT_SECRET,
  httpTimeout: 10000,
  authorizationParams: {
    scope: config.AUTH0_SCOPE,
    audience: config.AUTH0_AUDIENCE_MANAGEMENT_API,
  },
  routes: {
    callback: config.AUTH0_CALLBACK_URL,
    postLogoutRedirect: config.POST_LOGOUT_REDIRECT_URI,
  },
  secret: config.SESSION_COOKIE_SECRET,

  session: {
    cookie: {
      path: '/',
      httpOnly: true,
      secure: /^https:\/\//.test(config.APP_URL), // Set to true if website is doing https
      sameSite: 'lax',
    },
    name: config.AUTH_COOKIE_NAME,
    rollingDuration: 60 * 60 * 24 * 10,
    absoluteDuration: false,
  },
}
