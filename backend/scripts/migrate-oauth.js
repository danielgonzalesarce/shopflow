require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

async function run() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    console.error('Falta DATABASE_URL en .env (connection string de Supabase)')
    process.exit(1)
  }

  const sqlPath = path.join(__dirname, '../src/config/oauth-migration.sql')
  const sql = fs.readFileSync(sqlPath, 'utf8')

  const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } })

  try {
    await client.connect()
    await client.query(sql)
    console.log('Migración OAuth aplicada correctamente')
  } catch (error) {
    console.error('Error en migración OAuth:', error.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

run()
