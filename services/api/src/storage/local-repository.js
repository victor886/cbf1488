import fs from 'node:fs/promises'
import path from 'node:path'
import { freshSeed } from '../data/seed-data.js'

function clone(value) {
  return value == null ? value : structuredClone(value)
}

export class LocalRepository {
  constructor(filePath, uploadDir) {
    this.filePath = filePath
    this.uploadDir = uploadDir
    this.queue = Promise.resolve()
  }

  async init() {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true })
    await fs.mkdir(this.uploadDir, { recursive: true })
    try {
      await fs.access(this.filePath)
    } catch {
      await this.#write(freshSeed())
    }
    return this
  }

  async list(collection) {
    const state = await this.#read()
    return clone(state[collection] || [])
  }

  async get(collection, id) {
    const state = await this.#read()
    return clone((state[collection] || []).find(item => item.id === id) || null)
  }

  async insert(collection, document) {
    return this.#locked(async () => {
      const state = await this.#read()
      state[collection] ||= []
      state[collection].push(clone(document))
      await this.#write(state)
      return clone(document)
    })
  }

  async mutate(collection, id, updater) {
    return this.#locked(async () => {
      const state = await this.#read()
      const list = state[collection] || []
      const index = list.findIndex(item => item.id === id)
      if (index < 0) return null
      const current = clone(list[index])
      const updated = await updater(current)
      if (updated !== undefined) list[index] = clone(updated)
      await this.#write(state)
      return clone(list[index])
    })
  }

  async reset() {
    return this.#locked(async () => this.#write(freshSeed()))
  }

  async close() {}

  async #read() {
    try {
      return JSON.parse(await fs.readFile(this.filePath, 'utf8'))
    } catch (error) {
      if (error.code === 'ENOENT') {
        const seeded = freshSeed()
        await this.#write(seeded)
        return seeded
      }
      throw error
    }
  }

  async #write(state) {
    const temporary = `${this.filePath}.tmp`
    await fs.writeFile(temporary, `${JSON.stringify(state, null, 2)}\n`, 'utf8')
    await fs.rename(temporary, this.filePath)
  }

  async #locked(operation) {
    const next = this.queue.then(operation, operation)
    this.queue = next.then(() => undefined, () => undefined)
    return next
  }
}
