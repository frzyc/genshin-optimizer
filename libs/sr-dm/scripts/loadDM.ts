import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

const projectDir = path.resolve(__dirname, '..')
const hashFilePath = `${projectDir}/version.hash`

if (fs.existsSync(`${projectDir}/StarRailData`)) {
  console.log(`${projectDir} exists. Fetching...`)
  execSync(`git fetch`, { cwd: `${projectDir}/StarRailData` })
} else {
  console.log(`${projectDir}/StarRailData doesn't exist, cloning repo...`)
  execSync(
    `git clone https://github.com/Dimbreath/StarRailData.git --depth 1 StarRailData`,
    { cwd: projectDir }
  )
}

// Export and verify the hash file
const curVersion = execSync(`git rev-parse origin/master`, { cwd: `${projectDir}/StarRailData` })?.toString() ?? 'ERR'
const fileHash =
  (fs.existsSync(hashFilePath) && fs.readFileSync(hashFilePath)?.toString()) ||
  ''
if (!fileHash || curVersion !== fileHash) {
  console.log(`Resetting StarRailData to new version...`)
  fs.writeFileSync(hashFilePath, curVersion)
  execSync(`git reset --hard origin/master`, {
    cwd: `${projectDir}/StarRailData`,
  })
}
