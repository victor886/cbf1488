import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))

export const config = {
  env: process.env.NODE_ENV || 'development',
  seedDemo: process.env.SEED_DEMO_DATA === 'true' || (process.env.NODE_ENV || 'development') !== 'production',
  port: Number(process.env.PORT || 1488),
  storageDriver: process.env.STORAGE_DRIVER || 'local',
  localDataFile: path.resolve(here, '..', process.env.LOCAL_DATA_FILE || '.data/database.json'),
  uploadDir: path.resolve(here, '..', process.env.LOCAL_UPLOAD_DIR || '.data/uploads'),
  databaseUrl: process.env.DATABASE_URL || '',
  cloudbaseEnvId: process.env.CLOUDBASE_ENV_ID || '',
  cloudbaseApiKey: process.env.CLOUDBASE_API_KEY || '',
  cloudbaseGateway: process.env.CLOUDBASE_GATEWAY === 'true',
  databasePoolMax: Number(process.env.DATABASE_POOL_MAX || 5),
  tokenSecret: process.env.TOKEN_SECRET || 'local-only-cbf1488-secret-change-before-deploy',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map(value => value.trim()).filter(Boolean)
}
