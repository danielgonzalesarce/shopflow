const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const supabase = require('./config/database')
const errorHandler = require('./middlewares/errorHandler')

const authRoutes = require('./routes/auth.routes')
const productRoutes = require('./routes/product.routes')
const cartRoutes = require('./routes/cart.routes')
const wishlistRoutes = require('./routes/wishlist.routes')
const orderRoutes = require('./routes/order.routes')

const app = express()

app.set('trust proxy', 1)

app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}))
app.use(express.json())

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: true,
      message: 'Demasiados intentos. Máximo 10 peticiones por minuto. Intenta de nuevo más tarde.'
    })
  }
})

// Routes
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/favorites', wishlistRoutes)
app.use('/api/orders', orderRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ShopFlow API running' })
})

app.get('/api/health/db', async (req, res) => {
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!process.env.SUPABASE_URL || !key || key.includes('PEGAR_')) {
    return res.status(503).json({
      connected: false,
      error: 'Falta configurar SUPABASE_URL o SUPABASE_SERVICE_KEY en .env'
    })
  }

  const { error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 })

  if (error) {
    return res.status(503).json({ connected: false, error: error.message })
  }

  res.json({ connected: true, message: 'Supabase conectado correctamente' })
})

app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: 'Ruta no encontrada'
  })
})

app.use(errorHandler)

module.exports = app
