import { initAuth0 } from '@auth0/nextjs-auth0'

import { auth0Configs } from './auth0Configs'

const auth0 = initAuth0({
  ...auth0Configs,
})

const {
  handleLogin,
  handleCallback,
  handleLogout,
  handleProfile,
  getSession,
  updateSession,
  getAccessToken,
} = auth0

export {
  handleLogin,
  handleCallback,
  handleLogout,
  handleProfile,
  getSession,
  updateSession,
  getAccessToken,
}
