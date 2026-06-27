function normalizeOrigin(url) {
  if (!url || typeof url !== 'string') return null
  return url.trim().replace(/\/$/, '')
}

function getAllowedOrigins() {
  const origins = new Set()

  const primary = normalizeOrigin(process.env.FRONTEND_URL)
  if (primary) origins.add(primary)

  const extra = process.env.FRONTEND_URLS || ''
  extra
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean)
    .forEach((origin) => origins.add(origin))

  if (process.env.NODE_ENV !== 'production') {
    origins.add('http://localhost:3000')
    origins.add('http://127.0.0.1:3000')
  }

  return [...origins]
}

function createCorsOptions() {
  const allowedOrigins = getAllowedOrigins()

  return {
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true)
      }

      const normalized = normalizeOrigin(origin)

      if (allowedOrigins.includes(normalized)) {
        return callback(null, true)
      }

      return callback(new Error(`Origen no permitido por CORS: ${origin}`))
    },
    credentials: true
  }
}

module.exports = { createCorsOptions, getAllowedOrigins }
