import './load-env.js'
import { createApp } from './app.js'
import { config } from './config.js'
import { createRepository } from './storage/create-repository.js'

if (config.env === 'production') {
  if (!['postgres', 'cloudbase'].includes(config.storageDriver)) throw new Error('Production API must use PostgreSQL storage.')
  if (config.storageDriver === 'postgres' && !config.databaseUrl) throw new Error('Production API requires DATABASE_URL.')
  if (config.storageDriver === 'cloudbase' && (!config.cloudbaseEnvId || !config.cloudbaseApiKey)) {
    throw new Error('Production API requires CLOUDBASE_ENV_ID and CLOUDBASE_API_KEY when STORAGE_DRIVER=cloudbase.')
  }
  if (!process.env.TOKEN_SECRET || process.env.TOKEN_SECRET.length < 32) throw new Error('Production API requires a TOKEN_SECRET of at least 32 characters.')
}

const repository = await createRepository()
const app = createApp(repository)
const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`CBF1488 API listening on http://127.0.0.1:${config.port}`)
  console.log(`Storage driver: ${config.storageDriver}`)
})

async function shutdown(signal) {
  console.log(`Received ${signal}, shutting down`)
  server.close(async () => {
    await repository.close()
    process.exit(0)
  })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
