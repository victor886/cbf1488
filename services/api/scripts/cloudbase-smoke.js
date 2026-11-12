import crypto from 'node:crypto'
import '../src/load-env.js'
import { CloudBaseRepository } from '../src/storage/cloudbase-repository.js'

const collection = '__cbf1488_smoke'
const id = `smoke_${crypto.randomUUID()}`
const envId = process.env.CLOUDBASE_ENV_ID
const apiKey = process.env.CLOUDBASE_API_KEY
const repository = new CloudBaseRepository(envId, apiKey)
const endpoint = `https://${envId}.api.tcloudbasegateway.com/v1/rdb/rest/app_documents`

async function deleteTestRow() {
  const url = new URL(endpoint)
  url.searchParams.set('collection', `eq.${collection}`)
  url.searchParams.set('id', `eq.${id}`)
  const response = await fetch(url, {
    method: 'DELETE',
    headers: { authorization: `Bearer ${apiKey}`, prefer: 'return=minimal' }
  })
  if (!response.ok) throw new Error(`CloudBase PG cleanup failed with HTTP ${response.status}.`)
  if (await repository.get(collection, id)) throw new Error('CloudBase PG cleanup verification failed: the test row still exists.')
}

let testError
try {
  await repository.init()
  const document = { id, name: 'temporary cloud smoke test', count: 1 }
  await repository.insert(collection, document)
  const inserted = await repository.get(collection, id)
  if (inserted?.name !== document.name) throw new Error('CloudBase PG insert/read check failed.')
  const updated = await repository.mutate(collection, id, current => ({ ...current, count: 2 }))
  if (updated?.count !== 2) throw new Error('CloudBase PG optimistic update check failed.')
  console.log('CloudBase PG remote smoke test passed: health, insert, read, versioned update.')
} catch (error) {
  testError = error
} finally {
  try {
    await deleteTestRow()
    console.log('Temporary smoke-test row deleted and absence verified.')
  } catch (cleanupError) {
    console.error(cleanupError.message)
    testError ||= cleanupError
  }
}

if (testError) {
  console.error(testError.message)
  process.exitCode = 1
}
