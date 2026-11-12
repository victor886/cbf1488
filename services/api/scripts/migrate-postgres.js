import '../src/load-env.js'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const { Pool } = pg
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const migrationsDirectory = path.resolve(scriptDirectory, '..', 'db', 'migrations')
const connectionString = process.env.DATABASE_URL

if (!connectionString) throw new Error('Set DATABASE_URL before running database migrations.')

const pool = new Pool({ connectionString, max: 1, connectionTimeoutMillis: 5_000 })
try {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version text PRIMARY KEY,
      name text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `)

  const files = (await fs.readdir(migrationsDirectory)).filter(name => name.endsWith('.sql')).sort()
  for (const file of files) {
    const version = file.slice(0, 14)
    const name = file.slice(15, -4)
    const { rowCount } = await pool.query('SELECT 1 FROM schema_migrations WHERE version = $1', [version])
    if (rowCount) continue

    const sql = await fs.readFile(path.join(migrationsDirectory, file), 'utf8')
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query(sql)
      await client.query('INSERT INTO schema_migrations (version, name) VALUES ($1, $2)', [version, name])
      await client.query('COMMIT')
      console.log(`Applied ${file}`)
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }
} finally {
  await pool.end()
}
