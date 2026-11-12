import { config } from '../config.js'
import { LocalRepository } from './local-repository.js'
import { PostgresRepository } from './postgres-repository.js'
import { CloudBaseRepository } from './cloudbase-repository.js'

export async function createRepository() {
  const repository = config.storageDriver === 'postgres'
    ? new PostgresRepository(config.databaseUrl, config.databasePoolMax)
    : config.storageDriver === 'cloudbase'
      ? new CloudBaseRepository(config.cloudbaseEnvId, config.cloudbaseApiKey)
      : new LocalRepository(config.localDataFile, config.uploadDir)
  return repository.init()
}
