const crypto = require('crypto')
const supabase = require('../config/database')
const { generateToken } = require('../utils/jwt.utils')

function getBackendUrl() {
  return (process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`).replace(/\/$/, '')
}

function getFrontendUrl() {
  return (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '')
}

function createOAuthState(redirectPath = '/') {
  const payload = JSON.stringify({
    redirect: redirectPath,
    nonce: crypto.randomBytes(16).toString('hex')
  })
  return Buffer.from(payload).toString('base64url')
}

function parseOAuthState(state) {
  try {
    const parsed = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'))
    const redirect = typeof parsed.redirect === 'string' ? parsed.redirect : '/'
    if (!redirect.startsWith('/') || redirect.startsWith('//')) {
      return '/'
    }
    return redirect
  } catch {
    return '/'
  }
}

function redirectWithToken(res, token, redirectPath) {
  const frontend = getFrontendUrl()
  const url = new URL('/auth/callback', frontend)
  url.searchParams.set('token', token)
  if (redirectPath && redirectPath !== '/') {
    url.searchParams.set('redirect', redirectPath)
  }
  return res.redirect(url.toString())
}

function redirectWithError(res, message, redirectPath = '/auth/login') {
  const frontend = getFrontendUrl()
  const url = new URL(redirectPath, frontend)
  url.searchParams.set('error', message)
  return res.redirect(url.toString())
}

async function findOrCreateOAuthUser({ provider, oauthId, email, fullName }) {
  const normalizedEmail = email.toLowerCase().trim()

  const { data: byOAuth } = await supabase
    .from('users')
    .select('id, email, full_name, role, created_at, oauth_provider, oauth_id')
    .eq('oauth_provider', provider)
    .eq('oauth_id', oauthId)
    .maybeSingle()

  if (byOAuth) {
    return byOAuth
  }

  const { data: byEmail } = await supabase
    .from('users')
    .select('id, email, full_name, role, created_at, oauth_provider, oauth_id, password_hash')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (byEmail) {
    if (byEmail.oauth_provider && byEmail.oauth_provider !== provider) {
      const other = byEmail.oauth_provider === 'google' ? 'Google' : 'GitHub'
      throw new Error(
        `Este correo ya está vinculado con ${other}. Usa el botón "Continuar con ${other}" para entrar.`
      )
    }

    if (!byEmail.oauth_provider) {
      const { data: linked, error } = await supabase
        .from('users')
        .update({ oauth_provider: provider, oauth_id: oauthId })
        .eq('id', byEmail.id)
        .select('id, email, full_name, role, created_at')
        .single()

      if (error) {
        console.error('[OAuth] Error al vincular cuenta:', error.message)
        if (error.code === '42703' || error.code === 'PGRST204') {
          throw new Error(
            'La base de datos no está lista para OAuth. Ejecuta oauth-migration.sql en Supabase.'
          )
        }
        throw new Error('No se pudo vincular la cuenta OAuth')
      }
      return linked
    }

    return byEmail
  }

  const { data: created, error } = await supabase
    .from('users')
    .insert({
      email: normalizedEmail,
      password_hash: null,
      full_name: fullName.trim() || normalizedEmail.split('@')[0],
      role: 'cliente',
      oauth_provider: provider,
      oauth_id: oauthId
    })
    .select('id, email, full_name, role, created_at')
    .single()

  if (error) {
    console.error('[OAuth] Error al crear usuario:', error.message, error.code)
    if (error.code === '42703' || error.code === 'PGRST204' || error.message?.includes('oauth_')) {
      throw new Error(
        'La base de datos no está lista para OAuth. Ejecuta backend/src/config/oauth-migration.sql en Supabase SQL Editor.'
      )
    }
    if (error.code === '23505') {
      throw new Error(
        'Este correo ya está registrado. Inicia sesión con el método que usaste antes (Google, GitHub o email).'
      )
    }
    throw new Error(`No se pudo crear la cuenta: ${error.message}`)
  }

  return created
}

async function issueAuthRedirect(res, user, redirectPath) {
  const token = generateToken({ id: user.id })
  return redirectWithToken(res, token, redirectPath)
}

module.exports = {
  getBackendUrl,
  getFrontendUrl,
  createOAuthState,
  parseOAuthState,
  redirectWithError,
  findOrCreateOAuthUser,
  issueAuthRedirect
}
