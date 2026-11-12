import pg from 'pg'
import { config } from '../config.js'
import { freshSeed } from '../data/seed-data.js'

const { Pool } = pg

export class PostgresRepository {
  constructor(connectionString, maxConnections = 5) {
    if (!connectionString) throw new Error('DATABASE_URL is required when STORAGE_DRIVER=postgres.')
    this.pool = new Pool({
      connectionString,
      max: maxConnections,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 5_000,
      keepAlive: true
    })
  }

  async init() {
    await this.healthCheck()
    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')
      await client.query('LOCK TABLE app_documents IN EXCLUSIVE MODE')
      const { rows } = await client.query('SELECT count(*)::int AS count FROM app_documents')
      if (rows[0].count === 0 && config.seedDemo) {
        const seed = freshSeed()
        for (const [collection, documents] of Object.entries(seed)) {
          for (const document of documents) {
            await client.query(
              'INSERT INTO app_documents (collection, id, data) VALUES ($1, $2, $3::jsonb)',
              [collection, document.id, JSON.stringify(document)]
            )
          }
        }
      }
      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      if (error.code === '42P01') throw new Error('PostgreSQL schema is missing. Run `npm run db:migrate --workspace @cbf1488/api` before starting the API.')
      throw error
    } finally {
      client.release()
    }
    return this
  }

  async healthCheck() {
    await this.pool.query('SELECT 1')
  }

  async list(collection) {
    const { rows } = await this.pool.query(
      'SELECT data FROM app_documents WHERE collection = $1 ORDER BY row_order ASC',
      [collection]
    )
    return rows.map(row => row.data)
  }

  async get(collection, id) {
    const { rows } = await this.pool.query(
      'SELECT data FROM app_documents WHERE collection = $1 AND id = $2',
      [collection, id]
    )
    return rows[0]?.data ?? null
  }

  async insert(collection, document) {
    await this.pool.query(
      'INSERT INTO app_documents (collection, id, data) VALUES ($1, $2, $3::jsonb)',
      [collection, document.id, JSON.stringify(document)]
    )
    return document
  }

  async mutate(collection, id, updater) {
    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')
      const { rows } = await client.query(
        'SELECT data FROM app_documents WHERE collection = $1 AND id = $2 FOR UPDATE',
        [collection, id]
      )
      if (!rows[0]) {
        await client.query('COMMIT')
        return null
      }
      const updated = await updater(rows[0].data)
      if (updated !== undefined) {
        await client.query(
          'UPDATE app_documents SET data = $3::jsonb, version = version + 1, updated_at = now() WHERE collection = $1 AND id = $2',
          [collection, id, JSON.stringify(updated)]
        )
      }
      await client.query('COMMIT')
      return updated === undefined ? rows[0].data : updated
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  async reset() {
    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')
      await client.query('LOCK TABLE app_documents IN EXCLUSIVE MODE')
      await client.query('TRUNCATE app_documents RESTART IDENTITY')
      const seed = freshSeed()
      for (const [collection, documents] of Object.entries(seed)) {
        for (const document of documents) {
          await client.query(
            'INSERT INTO app_documents (collection, id, data) VALUES ($1, $2, $3::jsonb)',
            [collection, document.id, JSON.stringify(document)]
          )
        }
      }
      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  async close() {
    await this.pool.end()
  }
}
