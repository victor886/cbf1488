const TABLE = 'app_documents'
const MAX_MUTATE_ATTEMPTS = 8

export class CloudBaseRepository {
  constructor(envId, apiKey, fetchImplementation = fetch) {
    if (!envId) throw new Error('CLOUDBASE_ENV_ID is required when STORAGE_DRIVER=cloudbase.')
    if (!apiKey) throw new Error('CLOUDBASE_API_KEY is required when STORAGE_DRIVER=cloudbase.')
    this.baseUrl = `https://${envId}.api.tcloudbasegateway.com/v1/rdb/rest/${TABLE}`
    this.apiKey = apiKey
    this.fetch = fetchImplementation
  }

  async init() {
    await this.healthCheck()
    return this
  }

  async healthCheck() {
    await this.#request('GET', { select: 'id', limit: '1' })
  }

  async list(collection) {
    const rows = await this.#request('GET', {
      select: 'data',
      collection: `eq.${collection}`,
      order: 'row_order.asc'
    })
    return rows.map(row => row.data)
  }

  async get(collection, id) {
    const rows = await this.#request('GET', {
      select: 'data,version',
      collection: `eq.${collection}`,
      id: `eq.${id}`,
      limit: '1'
    })
    return rows[0]?.data ?? null
  }

  async insert(collection, document) {
    await this.#request('POST', {}, { collection, id: document.id, data: document }, 'return=minimal')
    return document
  }

  async mutate(collection, id, updater) {
    for (let attempt = 0; attempt < MAX_MUTATE_ATTEMPTS; attempt += 1) {
      const rows = await this.#request('GET', {
        select: 'data,version',
        collection: `eq.${collection}`,
        id: `eq.${id}`,
        limit: '1'
      })
      const row = rows[0]
      if (!row) return null

      const updated = await updater(row.data)
      if (updated === undefined) return row.data

      const changed = await this.#request('PATCH', {
        collection: `eq.${collection}`,
        id: `eq.${id}`,
        version: `eq.${row.version}`
      }, { data: updated, version: Number(row.version) + 1, updated_at: new Date().toISOString() }, 'return=representation')
      if (changed.length) return changed[0].data
    }

    throw new Error(`CloudBase PG document update conflicted too many times (${TABLE}/${collection}/${id}).`)
  }

  async reset() {
    throw new Error('CloudBase repository reset is disabled to prevent deleting environment data.')
  }

  async close() {}

  async #request(method, query = {}, body, prefer) {
    const url = new URL(this.baseUrl)
    for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value)
    const headers = {
      authorization: `Bearer ${this.apiKey}`,
      accept: 'application/json'
    }
    if (body !== undefined) headers['content-type'] = 'application/json'
    if (prefer) headers.prefer = prefer

    const response = await this.fetch(url, {
      method,
      headers,
      ...(body === undefined ? {} : { body: JSON.stringify(body) })
    })
    const text = await response.text()
    let payload = null
    if (text) {
      try {
        payload = JSON.parse(text)
      } catch {
        payload = text
      }
    }
    if (!response.ok) {
      const message = typeof payload === 'object' && payload?.message
        ? payload.message
        : `CloudBase PG request failed with HTTP ${response.status}.`
      const error = new Error(message)
      error.status = response.status
      error.code = typeof payload === 'object' ? payload?.code : undefined
      throw error
    }
    return Array.isArray(payload) ? payload : []
  }
}
