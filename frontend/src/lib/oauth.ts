const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export function getGoogleAuthUrl(redirect = '/') {
  const params = new URLSearchParams({ redirect })
  return `${API_URL}/auth/google?${params}`
}

export function getGitHubAuthUrl(redirect = '/') {
  const params = new URLSearchParams({ redirect })
  return `${API_URL}/auth/github?${params}`
}

export async function fetchOAuthStatus(): Promise<{
  google: boolean
  github: boolean
  dbReady: boolean
}> {
  try {
    const res = await fetch(`${API_URL}/auth/oauth/status`, { cache: 'no-store' })
    if (!res.ok) return { google: false, github: false, dbReady: false }
    const json = await res.json()
    return json.data ?? { google: false, github: false, dbReady: false }
  } catch {
    return { google: false, github: false, dbReady: false }
  }
}
