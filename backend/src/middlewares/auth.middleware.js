const supabase = require('../config/database')
const { verifyToken } = require('../utils/jwt.utils')

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: true,
        message: 'Token de autenticación no proporcionado'
      })
    }

    const token = authHeader.split(' ')[1]
    const payload = verifyToken(token)

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role, full_name')
      .eq('id', payload.id)
      .single()

    if (error || !user) {
      return res.status(401).json({
        error: true,
        message: 'Usuario no encontrado o token inválido'
      })
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name
    }

    next()
  } catch (error) {
    return res.status(401).json({
      error: true,
      message: error.message || 'Token inválido'
    })
  }
}

module.exports = authMiddleware
