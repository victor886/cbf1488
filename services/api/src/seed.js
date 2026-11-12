import './load-env.js'
import { config } from './config.js'
import { createRepository } from './storage/create-repository.js'

if (config.env === 'production') throw new Error('Refusing to reset production data with the demo seed command.')

const repository = await createRepository()
await repository.reset()
await repository.close()
console.log(`Seed data reset for ${config.storageDriver} storage.`)
