import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const serviceRoot = path.resolve(scriptDirectory, '..')
const outputDirectory = path.join(serviceRoot, '.deploy', 'cloudbase-http')

fs.rmSync(outputDirectory, { recursive: true, force: true })
fs.mkdirSync(outputDirectory, { recursive: true })
fs.cpSync(path.join(serviceRoot, 'src'), path.join(outputDirectory, 'src'), { recursive: true })
fs.copyFileSync(path.join(serviceRoot, 'package.json'), path.join(outputDirectory, 'package.json'))
fs.copyFileSync(path.join(serviceRoot, 'cloudbase', 'scf_bootstrap'), path.join(outputDirectory, 'scf_bootstrap'))
fs.chmodSync(path.join(outputDirectory, 'scf_bootstrap'), 0o755)

const install = spawnSync('npm', ['install', '--omit=dev', '--no-audit', '--no-fund'], {
  cwd: outputDirectory,
  stdio: 'inherit'
})
if (install.status !== 0) throw new Error(`Failed to install CloudBase function dependencies (status ${install.status}).`)

console.log(`CloudBase HTTP Function package prepared at ${outputDirectory}`)
console.log('Excluded: local .data, .env files, documentation, and Dockerfile')
