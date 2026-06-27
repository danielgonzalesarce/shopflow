const supabase = require('../config/database')
const {
  getBackendUrl,
  createOAuthState,
  parseOAuthState,
  redirectWithError,
  findOrCreateOAuthUser,
  issueAuthRedirect
} = require('../services/oauth.service')

async function checkOAuthDatabaseReady() {
  const { error } = await supabase.from('users').select('oauth_provider, oauth_id').limit(1)
  return !error
}

function isGoogleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
}

function isGitHubConfigured() {
  return Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET)
}

async function startGoogle(req, res) {
  if (!isGoogleConfigured()) {
    return res.status(503).json({
      error: true,
      message: 'Google OAuth no está configurado en el servidor'
    })
  }

  const redirect = typeof req.query.redirect === 'string' ? req.query.redirect : '/'
  const state = createOAuthState(redirect)
  const backend = getBackendUrl()

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${backend}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'online',
    prompt: 'select_account'
  })

  return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
}

async function googleCallback(req, res) {
  if (!isGoogleConfigured()) {
    return redirectWithError(res, 'Google OAuth no configurado')
  }

  const { code, state, error } = req.query

  if (error) {
    return redirectWithError(res, 'Inicio de sesión con Google cancelado')
  }

  if (!code || !state) {
    return redirectWithError(res, 'Respuesta de Google incompleta')
  }

  const redirectPath = parseOAuthState(state)
  const backend = getBackendUrl()

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${backend}/api/auth/google/callback`,
        grant_type: 'authorization_code'
      })
    })

    const tokenData = await tokenRes.json()

    if (!tokenRes.ok || !tokenData.access_token) {
      return redirectWithError(res, 'No se pudo validar la cuenta de Google')
    }

    const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    })

    const profile = await profileRes.json()

    if (!profileRes.ok || !profile.email) {
      return redirectWithError(res, 'Google no proporcionó un correo válido')
    }

    const user = await findOrCreateOAuthUser({
      provider: 'google',
      oauthId: profile.sub,
      email: profile.email,
      fullName: profile.name || profile.given_name || profile.email
    })

    return issueAuthRedirect(res, user, redirectPath)
  } catch (err) {
    return redirectWithError(res, err.message || 'Error al iniciar sesión con Google')
  }
}

async function startGitHub(req, res) {
  if (!isGitHubConfigured()) {
    return res.status(503).json({
      error: true,
      message: 'GitHub OAuth no está configurado en el servidor'
    })
  }

  const redirect = typeof req.query.redirect === 'string' ? req.query.redirect : '/'
  const state = createOAuthState(redirect)
  const backend = getBackendUrl()

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: `${backend}/api/auth/github/callback`,
    scope: 'read:user user:email',
    state
  })

  return res.redirect(`https://github.com/login/oauth/authorize?${params}`)
}

async function githubCallback(req, res) {
  if (!isGitHubConfigured()) {
    return redirectWithError(res, 'GitHub OAuth no configurado')
  }

  const { code, state, error } = req.query

  if (error) {
    return redirectWithError(res, 'Inicio de sesión con GitHub cancelado')
  }

  if (!code || !state) {
    return redirectWithError(res, 'Respuesta de GitHub incompleta')
  }

  const redirectPath = parseOAuthState(state)
  const backend = getBackendUrl()

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${backend}/api/auth/github/callback`
      })
    })

    const tokenData = await tokenRes.json()

    if (!tokenRes.ok || !tokenData.access_token) {
      return redirectWithError(res, 'No se pudo validar la cuenta de GitHub')
    }

    const headers = {
      Authorization: `Bearer ${tokenData.access_token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'ShopFlow-App'
    }

    const profileRes = await fetch('https://api.github.com/user', { headers })
    const profile = await profileRes.json()

    if (!profileRes.ok || !profile.id) {
      return redirectWithError(res, 'No se pudo obtener el perfil de GitHub')
    }

    let email = profile.email

    if (!email) {
      const emailsRes = await fetch('https://api.github.com/user/emails', { headers })
      const emails = await emailsRes.json()

      if (emailsRes.ok && Array.isArray(emails)) {
        const primary = emails.find((e) => e.primary && e.verified)
        const verified = emails.find((e) => e.verified)
        email = primary?.email || verified?.email || emails[0]?.email
      }
    }

    if (!email) {
      return redirectWithError(
        res,
        'GitHub no tiene un correo público. Actívalo en la configuración de GitHub.'
      )
    }

    const user = await findOrCreateOAuthUser({
      provider: 'github',
      oauthId: String(profile.id),
      email,
      fullName: profile.name || profile.login || email
    })

    return issueAuthRedirect(res, user, redirectPath)
  } catch (err) {
    return redirectWithError(res, err.message || 'Error al iniciar sesión con GitHub')
  }
}

async function oauthStatus(req, res) {
  const dbReady = await checkOAuthDatabaseReady()
  return res.json({
    success: true,
    data: {
      google: isGoogleConfigured(),
      github: isGitHubConfigured(),
      dbReady
    }
  })
}

module.exports = {
  startGoogle,
  googleCallback,
  startGitHub,
  githubCallback,
  oauthStatus
}
