const config = {
    REDIS_URL: process.env.REDIS_URL || '',
    REDIS_TOKEN: process.env.REDIS_TOKEN || '',
    AUTH0_ISSUER_BASE_URL: process.env.AUTH0_ISSUER_BASE_URL,
    APP_URL: process.env.APP_URL || 'localhost:3000',
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID || '',
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
    AUTH0_SCOPE: process.env.AUTH0_SCOPE || '',
    AUTH0_AUDIENCE_MANAGEMENT_API: process.env.AUTH0_AUDIENCE_MANAGEMENT_API,
    AUTH0_CALLBACK_URL: process.env.AUTH0_CALLBACK_URL,
    POST_LOGOUT_REDIRECT_URI: process.env.POST_LOGOUT_REDIRECT_URI || 'https://google.com',
    SESSION_COOKIE_SECRET: process.env.SESSION_COOKIE_SECRET,
    AUTH_COOKIE_NAME: process.env.AUTH_COOKIE_NAME || 'sessionCookie',
    STRING_ENCRYPTION_KEY: process.env.STRING_ENCRYPTION_KEY
}

export default config