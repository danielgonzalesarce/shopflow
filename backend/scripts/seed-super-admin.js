require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const bcrypt = require('bcryptjs')
const supabase = require('../src/config/database')

const SALT_ROUNDS = 10

const SUPER_ADMIN = {
  email: 'superadmin@shopflow.com',
  password: 'SuperAdmin2026!',
  full_name: 'Super Administrador',
  role: 'admin'
}

async function upsertAdmin({ email, password, full_name, role }) {
  const normalizedEmail = email.toLowerCase().trim()
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS)

  const { data: existing, error: lookupError } = await supabase
    .from('users')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (lookupError) {
    throw new Error(`Error al buscar usuario: ${lookupError.message}`)
  }

  if (existing) {
    const { error } = await supabase
      .from('users')
      .update({ password_hash, full_name, role })
      .eq('id', existing.id)

    if (error) {
      throw new Error(`Error al actualizar usuario: ${error.message}`)
    }

    console.log(`✓ Admin actualizado: ${normalizedEmail}`)
    return
  }

  const { error } = await supabase.from('users').insert({
    email: normalizedEmail,
    password_hash,
    full_name,
    role
  })

  if (error) {
    throw new Error(`Error al crear usuario: ${error.message}`)
  }

  console.log(`✓ Admin creado: ${normalizedEmail}`)
}

async function main() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.error('Faltan SUPABASE_URL o SUPABASE_SERVICE_KEY en backend/.env')
    process.exit(1)
  }

  await upsertAdmin(SUPER_ADMIN)

  console.log('\nCredenciales super admin:')
  console.log(`  Email:    ${SUPER_ADMIN.email}`)
  console.log(`  Password: ${SUPER_ADMIN.password}`)
  console.log('\nAccede en: http://localhost:3000/auth/login → /admin')
}

main().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})
