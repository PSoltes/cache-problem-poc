import { strict as assert, AssertionError } from 'assert'
import nodeCrypto from 'node:crypto'
import { TextDecoder as NodeTextDecoder, TextEncoder } from 'util'

import { Session } from '@auth0/nextjs-auth0'
import { Redis } from '@upstash/redis'
import { CookieSerializeOptions, parse, serialize } from 'cookie'
import { NextApiRequest, NextApiResponse } from 'next'

import config from 'config'
import { Encryption } from 'utils/encryption'

import { auth0Configs } from './auth0Configs'

type RedisStoreConfig = typeof auth0Configs & {
  redis: {
    url: string
    token: string
  }
}

const epoch = () => (Date.now() / 1000) | 0 // eslint-disable-line no-bitwise

const getCookies = (req: NextApiRequest) => parse(req.headers.cookie || '')

const setCookie = (
  res: NextApiResponse,
  name: string,
  value: string,
  options: CookieSerializeOptions = {}
) => {
  const strCookie = serialize(name, value, options)

  let previousCookies = res.getHeader('Set-Cookie') || []

  if (!Array.isArray(previousCookies)) {
    previousCookies = [previousCookies.toString()]
  }

  res.setHeader('Set-Cookie', [...previousCookies, strCookie])
}

const clearCookie = (
  res: NextApiResponse,
  name: string,
  options: CookieSerializeOptions = {}
) => {
  setCookie(res, name, '', { ...options, maxAge: 0 })
}

class RedisStore {
  config: RedisStoreConfig

  encryption: Encryption

  redisClient: Redis | null

  constructor(redisStoreConfig: RedisStoreConfig) {
    this.config = redisStoreConfig
    this.redisClient = null
    this.encryption = new Encryption(
      nodeCrypto.webcrypto,
      new TextEncoder(),
      new NodeTextDecoder('utf-8') as TextDecoder
    )
  }

  calculateExp(iat: number, uat: number) {
    const { absoluteDuration } = this.config.session
    const { rolling, rollingDuration } = this.config.session

    if (typeof absoluteDuration !== 'number') {
      return uat + rollingDuration
    }
    if (!rolling) {
      return iat + absoluteDuration
    }

    return Math.min(uat + rollingDuration, iat + absoluteDuration)
  }

  async read(req: NextApiRequest) {
    // To ensure redis is only instanciated on server side,
    // As it may be constructed client side and it cannot be instanciated client side
    // This enables us to instanciated it if we don't have one.
    if (!this.redisClient) {
      this.redisClient = new Redis({
        url: this.config.redis.url,
        token: this.config.redis.token,
      })
    }

    const cookies = getCookies(req)
    const {
      name: sessionName,
      rollingDuration,
      absoluteDuration,
    } = this.config.session

    try {
      if (sessionName in cookies) {
        const key: string = await this.encryption.decrypt(
          cookies[sessionName].slice(0, -2 * this.encryption.IV_LENGTH),
          cookies[sessionName].slice(-2 * this.encryption.IV_LENGTH)
        )

        const data = await this.redisClient?.get<{
          session: Session
          options: { iat: number; uat: number; exp: number }
        }>(key)

        if (data) {
          assert(
            data.options.exp > epoch(),
            'it is expired based on options when it was established'
          )

          if (rollingDuration) {
            assert(
              data.options.uat + rollingDuration > epoch(),
              'it is expired based on current rollingDuration rules'
            )
          }

          // check that the existing session isn't expired based on current absoluteDuration rules
          if (typeof absoluteDuration === 'number') {
            assert(
              data.options.iat + absoluteDuration > epoch(),
              'it is expired based on current absoluteDuration rules'
            )
          }

          return [data.session, data.options.iat]
        }
      }
    } catch (err) {
      if (err instanceof AssertionError) {
        console.log(`existing session was rejected because ${err.message}`, {
          req,
        })
      } else {
        console.error(`unexpected error handling session ${err}`, { req })
      }
    }

    return []
  }

  async save(
    req: NextApiRequest,
    res: NextApiResponse,
    session: Record<string, any>,
    createdAt: number
  ) {
    const {
      cookie: { transient = false, ...cookieConfig } = {},
      name: sessionName,
    } = this.config.session

    if (!res) {
      throw new Error('Response is not available')
    }

    if (!req) {
      throw new Error('Request is not available')
    }

    if (!session?.user) {
      Object.keys(getCookies(req)).forEach((cookieName) => {
        if (cookieName.match(`^${sessionName}(?:\\.\\d)?$`)) {
          clearCookie(res, cookieName, {
            domain: cookieConfig.domain,
            path: cookieConfig.path,
          })
        }
      })

      return
    }

    // To ensure redis is only instanciated on server side,
    // As it may be constructed client side and it cannot be instanciated client side
    // This enables us to instanciated it if we don't have one.
    if (!this.redisClient) {
      this.redisClient = new Redis({
        url: this.config.redis.url,
        token: this.config.redis.token,
      })
    }

    const uat = epoch()
    const iat = typeof createdAt === 'number' ? createdAt : uat
    const exp = this.calculateExp(iat, uat)

    const cookieOptions: CookieSerializeOptions = {
      ...cookieConfig,
    }

    if (!transient) {
      cookieOptions.expires = new Date(exp * 1000)
    }
    const cookies = getCookies(req)

    let key = cookies[sessionName]

    if (!key) {
      const { encryptedText, iv } = await this.encryption.encrypt(
        session.user.email
      )

      key = `${encryptedText}${iv}`
    }

    setCookie(res, sessionName, key, cookieOptions)

    await this.redisClient?.set(
      session.user.email,
      JSON.stringify({ session, options: { iat, uat, exp } }),
      {
        ex: this.config.session.rollingDuration || 60 * 60 * 24 * 10,
      }
    )
  }
}

export const redisStore = new RedisStore({
  ...auth0Configs,
  redis: {
    url: config.REDIS_URL,
    token: config.REDIS_TOKEN,
  },
})
