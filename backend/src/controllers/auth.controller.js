const bcrypt = require('bcryptjs')
const supabase = require('../config/database')
const { generateToken } = require('../utils/jwt.utils')

const SALT_ROUNDS = 10

function omitPasswordHash(user) {
  const { password_hash, ...safeUser } = user
  return safeUser
}

async function register(req, res) {
  try {
    const { email, password, full_name } = req.body

    if (!email || !password || !full_name) {
      return res.status(400).json({
        error: true,
        message: 'Los campos email, password y full_name son obligatorios'
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: true,
        message: 'La contraseña debe tener al menos 6 caracteres'
      })
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    if (existingUser) {
      return res.status(409).json({
        error: true,
        message: 'El correo electrónico ya está registrado'
      })
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS)

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase().trim(),
        password_hash,
        full_name: full_name.trim(),
        role: 'cliente'
      })
      .select('id, email, full_name, role, created_at')
      .single()

    if (error) {
      return res.status(500).json({
        error: true,
        message: 'Error al registrar el usuario'
      })
    }

    const token = generateToken({ id: user.id })

    return res.status(201).json({
      success: true,
      data: {
        token,
        user
      }
    })
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    })
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: 'Los campos email y password son obligatorios'
      })
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password_hash, full_name, role, created_at')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    if (error || !user) {
      return res.status(401).json({
        error: true,
        message: 'Credenciales inválidas'
      })
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      return res.status(401).json({
        error: true,
        message: 'Credenciales inválidas'
      })
    }

    const token = generateToken({ id: user.id })

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: omitPasswordHash(user)
      }
    })
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    })
  }
}

async function getMe(req, res) {
  try {
    return res.status(200).json({
      success: true,
      data: req.user
    })
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    })
  }
}

module.exports = { register, login, getMe }
