import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

const projectDir = path.resolve(__dirname, '..')
const hashFilePath = `${projectDir}/version.hash`

if (fs.existsSync(`${projectDir}/AnimeGameData`)) {
  console.log(`${projectDir} exists. Fetching...`)
  execSync(`git fetch`, { cwd: `${projectDir}/AnimeGameData` })
  const curVersion =
    execSync(`git rev-parse origin/master`)?.toString() ?? 'ERR'
  const fileHash =
    (fs.existsSync(hashFilePath) &&
      fs.readFileSync(hashFilePath)?.toString()) ||
    ''
  if (!fileHash || curVersion !== fileHash) {
    console.log(`Resetting AnimeGameData to new version...`)
    fs.writeFileSync(hashFilePath, curVersion)
    execSync(`git reset --hard origin/master`, {
      cwd: `${projectDir}/AnimeGamenData`,
    })
  }
} else {
  console.log(`${projectDir}/AnimeGameData doesn't exist, cloning repo...`)
  execSync(
    `git clone https://gitlab.com/Dimbreath/AnimeGameData.git --depth 1 AnimeGameData`,
    { cwd: projectDir }
  )
}
