const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

async function main() {
  const { PG_PASSWORD, SUPABASE_PROJECT_REF, SUPABASE_DB_HOST, SUPABASE_DB_PORT } =
    process.env

  if (!PG_PASSWORD || !SUPABASE_PROJECT_REF || !SUPABASE_DB_HOST) {
    throw new Error(
      'Faltan variables: PG_PASSWORD, SUPABASE_PROJECT_REF y SUPABASE_DB_HOST'
    )
  }

  const sql = fs.readFileSync(
    path.join(__dirname, '../src/config/schema.sql'),
    'utf8'
  )

  const client = new Client({
    host: SUPABASE_DB_HOST,
    port: Number(SUPABASE_DB_PORT || 5432),
    database: 'postgres',
    user: `postgres.${SUPABASE_PROJECT_REF}`,
    password: PG_PASSWORD,
    ssl: { rejectUnauthorized: false }
  })

  await client.connect()

  await client.query(sql)

  const { rows } = await client.query(`
    SELECT
      (SELECT count(*)::int FROM users) AS users,
      (SELECT count(*)::int FROM categories) AS categories,
      (SELECT count(*)::int FROM products) AS products
  `)

  console.log('Schema ejecutado correctamente:', rows[0])
  await client.end()
}

main().catch((error) => {
  console.error('Error:', error.message)
  process.exit(1)
})
